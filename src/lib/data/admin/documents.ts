'use server';

import { createClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { notifyDocumentPublished } from '@/lib/services/notificationService';
import { PaginatedResult, ListOptions } from './types';
import { buildPaginatedResult } from '@/lib/utils/pagination';

type Document = Tables<'documents'>;

export async function getAdminDocuments(options: ListOptions & {
  category?: string;
  published?: boolean;
}): Promise<PaginatedResult<Document>> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', category, published } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('documents').select('*', { count: 'exact' });

  if (category) {
    query = query.eq('category', category);
  }

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  if (search) {
    const safeSearch = search.replace(/[.,()\[\]]/g, '');
    query = query.or(`title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching admin documents:', { error });
    return buildPaginatedResult(null, 0, page, pageSize);
  }

  return buildPaginatedResult(data, count, page, pageSize);
}

export async function getAdminDocument(id: string): Promise<Document | null> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();

  if (error) {
    logger.error('Error fetching document:', { error });
    return null;
  }

  return data;
}

export async function createDocument(data: TablesInsert<'documents'>): Promise<{ success: boolean; error?: string; data?: Document }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('documents').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (result.is_published) {
    notifyDocumentPublished({
      id: result.id,
      title: result.title,
      category: result.category,
    }).catch((e) => logger.error('Background notification failed', { error: e }));
  }

  revalidatePath('/[locale]/admin/documents');
  revalidatePath('/[locale]/documents');
  return { success: true, data: result };
}

export async function updateDocument(id: string, data: TablesUpdate<'documents'>): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  let wasPublished = false;
  if (data.is_published === true) {
    const { data: current } = await supabase.from('documents').select('is_published, title, category').eq('id', id).single();
    wasPublished = current?.is_published === false;

    if (wasPublished && current) {
      notifyDocumentPublished({
        id,
        title: data.title || current.title,
        category: data.category || current.category,
      }).catch((e) => logger.error('Background notification failed', { error: e }));
    }
  }

  const { error } = await supabase
    .from('documents')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/documents');
  revalidatePath('/[locale]/documents');
  return { success: true };
}

export async function deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error } = await supabase.from('documents').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/documents');
  revalidatePath('/[locale]/documents');
  return { success: true };
}
