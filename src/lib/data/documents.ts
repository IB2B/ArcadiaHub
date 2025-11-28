'use server';

import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';

type Document = Database['public']['Tables']['documents']['Row'];

export async function getDocuments(options?: {
  category?: string;
  folderPath?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Document[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.folderPath) {
    query = query.eq('folder_path', options.folderPath);
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
    console.error('Error fetching documents:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getLatestDocuments(limit: number = 5): Promise<Document[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest documents:', error);
    return [];
  }

  return data || [];
}

export async function getDocumentsByCategory(): Promise<Record<string, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .select('category')
    .eq('is_published', true);

  if (error || !data) {
    return {};
  }

  return data.reduce((acc: Record<string, number>, doc: { category: string }) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export async function getDocumentStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .select('category')
    .eq('is_published', true);

  if (error || !data) {
    return { total: 0, byCategory: {} };
  }

  const byCategory = data.reduce((acc: Record<string, number>, doc: { category: string }) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: data.length,
    byCategory,
  };
}
