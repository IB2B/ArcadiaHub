'use server';

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

type Document = Database['public']['Tables']['documents']['Row'];

export async function getDocuments(options?: {
  category?: string;
  folderPath?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Document[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('documents')
    .select('id, title, description, category, file_url, file_type, file_size, folder_path, is_published, created_at, updated_at', { count: 'exact' })
    .eq('is_published', true);

  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.folderPath) {
    query = query.eq('folder_path', options.folderPath);
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
    logger.error('Error fetching documents:', { error });
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

const _getLatestDocuments = unstable_cache(
  async (limit: number): Promise<Document[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching latest documents:', { error });
      return [];
    }

    return data || [];
  },
  ['latest-documents'],
  { revalidate: 300, tags: ['documents'] }
);

export async function getLatestDocuments(limit: number = 5): Promise<Document[]> {
  return _getLatestDocuments(limit);
}

export async function getDocument(documentId: string): Promise<Document | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    logger.error('Error fetching document:', { error });
    return null;
  }

  return data;
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
