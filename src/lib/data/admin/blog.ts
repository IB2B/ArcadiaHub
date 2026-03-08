'use server';

import { createClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { notifyBlogPostPublished } from '@/lib/services/notificationService';
import { PaginatedResult, ListOptions } from './types';

type BlogPost = Tables<'blog_posts'>;

export async function getAdminBlogPosts(options: ListOptions & {
  category?: string;
  published?: boolean;
}): Promise<PaginatedResult<BlogPost>> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', category, published } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('blog_posts').select('*', { count: 'exact' });

  if (category) {
    query = query.eq('category', category);
  }

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  if (search) {
    const safeSearch = search.replace(/[.,()\[\]]/g, '');
    query = query.or(`title.ilike.%${safeSearch}%,excerpt.ilike.%${safeSearch}%,content.ilike.%${safeSearch}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching admin blog posts:', { error });
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminBlogPost(id: string): Promise<BlogPost | null> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();

  if (error) {
    logger.error('Error fetching blog post:', { error });
    return null;
  }

  return data;
}

export async function createBlogPost(data: TablesInsert<'blog_posts'>): Promise<{ success: boolean; error?: string; data?: BlogPost }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('blog_posts').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (result.is_published) {
    notifyBlogPostPublished({
      slug: result.slug,
      title: result.title,
    }).catch((e) => logger.error('Background notification failed', { error: e }));
  }

  revalidatePath('/[locale]/admin/blog');
  revalidatePath('/[locale]/blog');
  return { success: true, data: result };
}

export async function updateBlogPost(id: string, data: TablesUpdate<'blog_posts'>): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  if (data.is_published === true) {
    const { data: current } = await supabase.from('blog_posts').select('is_published, slug, title').eq('id', id).single();

    if (current?.is_published === false) {
      notifyBlogPostPublished({
        slug: data.slug || current.slug,
        title: data.title || current.title,
      }).catch((e) => logger.error('Background notification failed', { error: e }));
    }
  }

  const { error } = await supabase
    .from('blog_posts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/blog');
  revalidatePath('/[locale]/blog');
  return { success: true };
}

export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/blog');
  revalidatePath('/[locale]/blog');
  return { success: true };
}
