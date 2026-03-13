'use server';

import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';

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

  // Increment view count atomically (BUG-5)
  await supabase.rpc('increment_view_count', { tbl: 'academy_content', row_id: itemId });

  return data;
}

export async function markContentComplete(
  contentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('content_completions')
    .upsert(
      { content_id: contentId, user_id: user.id, completed_at: new Date().toISOString() },
      { onConflict: 'content_id,user_id' }
    );

  if (error) return { success: false, error: error.message };

  revalidatePath('/[locale]/(dashboard)/academy/[id]', 'page');
  return { success: true };
}

export async function getMyCompletions(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('content_completions')
    .select('content_id')
    .eq('user_id', user.id);

  if (error || !data) return [];
  return data.map((c: { content_id: string }) => c.content_id);
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
