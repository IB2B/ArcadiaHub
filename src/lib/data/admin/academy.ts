'use server';

import { createClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { notifyAcademyContentPublished } from '@/lib/services/notificationService';
import { PaginatedResult, ListOptions } from './types';
import { buildPaginatedResult } from '@/lib/utils/pagination';

type AcademyContent = Tables<'academy_content'>;

export async function getAdminAcademyContent(options: ListOptions & {
  contentType?: string;
  year?: number;
  published?: boolean;
}): Promise<PaginatedResult<AcademyContent>> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', contentType, year, published } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('academy_content').select('*', { count: 'exact' });

  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  if (year) {
    query = query.eq('year', year);
  }

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  if (search) {
    const safeSearch = search.replace(/[.,()\[\]]/g, '');
    query = query.or(`title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,theme.ilike.%${safeSearch}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching admin academy content:', { error });
    return buildPaginatedResult(null, 0, page, pageSize);
  }

  return buildPaginatedResult(data, count, page, pageSize);
}

export async function getAdminAcademyItem(id: string): Promise<AcademyContent | null> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data, error } = await supabase.from('academy_content').select('*').eq('id', id).single();

  if (error) {
    logger.error('Error fetching academy item:', { error });
    return null;
  }

  return data;
}

export async function createAcademyContent(data: TablesInsert<'academy_content'>): Promise<{ success: boolean; error?: string; data?: AcademyContent }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('academy_content').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (result.is_published) {
    notifyAcademyContentPublished({
      id: result.id,
      title: result.title,
      content_type: result.content_type,
    }).catch((e) => logger.error('Background notification failed', { error: e }));
  }

  revalidatePath('/[locale]/admin/academy');
  revalidatePath('/[locale]/academy');
  return { success: true, data: result };
}

export async function updateAcademyContent(id: string, data: TablesUpdate<'academy_content'>): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  if (data.is_published === true) {
    const { data: current } = await supabase.from('academy_content').select('is_published, title, content_type').eq('id', id).single();

    if (current?.is_published === false) {
      notifyAcademyContentPublished({
        id,
        title: data.title || current.title,
        content_type: data.content_type || current.content_type,
      }).catch((e) => logger.error('Background notification failed', { error: e }));
    }
  }

  const { error } = await supabase
    .from('academy_content')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/academy');
  revalidatePath('/[locale]/academy');
  return { success: true };
}

export async function deleteAcademyContent(id: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error: completionsError } = await supabase.from('content_completions').delete().eq('content_id', id);
  if (completionsError) return { success: false, error: `Failed to delete content completions: ${completionsError.message}` };

  const { error } = await supabase.from('academy_content').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/academy');
  revalidatePath('/[locale]/academy');
  return { success: true };
}
