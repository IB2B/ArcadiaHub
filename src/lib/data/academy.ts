'use server';

import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';

type AcademyContent = Database['public']['Tables']['academy_content']['Row'];

export async function getAcademyContent(options?: {
  contentType?: string;
  year?: number;
  theme?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: AcademyContent[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('academy_content')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (options?.contentType) {
    query = query.eq('content_type', options.contentType);
  }
  if (options?.year) {
    query = query.eq('year', options.year);
  }
  if (options?.theme) {
    query = query.eq('theme', options.theme);
  }
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('created_at', { ascending: false });

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching academy content:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getLatestAcademyContent(limit: number = 5): Promise<AcademyContent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academy_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest academy content:', error);
    return [];
  }

  return data || [];
}

export async function getAcademyItem(itemId: string): Promise<AcademyContent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academy_content')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching academy item:', error);
    return null;
  }

  // Increment view count
  await supabase
    .from('academy_content')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', itemId);

  return data;
}

export async function getAcademyStats(): Promise<{
  totalContent: number;
  totalVideos: number;
  totalDuration: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('academy_content')
    .select('content_type, duration_minutes')
    .eq('is_published', true);

  if (error || !data) {
    return { totalContent: 0, totalVideos: 0, totalDuration: 0 };
  }

  return {
    totalContent: data.length,
    totalVideos: data.filter((c: { content_type: string }) => c.content_type === 'VIDEO').length,
    totalDuration: data.reduce((sum: number, c: { duration_minutes: number | null }) => sum + (c.duration_minutes || 0), 0),
  };
}
