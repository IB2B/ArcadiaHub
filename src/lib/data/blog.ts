'use server';

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export async function getBlogPosts(options?: {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: BlogPost[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, featured_image, author_id, category, tags, is_published, published_at, view_count, created_at, updated_at', { count: 'exact' })
    .eq('is_published', true);

  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.tag) {
    query = query.contains('tags', [options.tag]);
  }
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('published_at', { ascending: false });

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching blog posts:', { error });
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, featured_image, author_id, category, tags, is_published, published_at, view_count, created_at, updated_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    logger.error('Error fetching blog post:', { error });
    return null;
  }

  return data;
}

const _getLatestBlogPosts = unstable_cache(
  async (limit: number): Promise<BlogPost[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching latest blog posts:', { error });
      return [];
    }

    return data || [];
  },
  ['latest-blog-posts'],
  { revalidate: 300, tags: ['blog'] }
);

export async function getLatestBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  return _getLatestBlogPosts(limit);
}

const _getBlogCategories = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .eq('is_published', true)
      .not('category', 'is', null);

    if (error || !data) {
      return [];
    }

    const categories = [...new Set(data.map((d) => d.category).filter(Boolean))] as string[];
    return categories.sort();
  },
  ['blog-categories'],
  { revalidate: 600, tags: ['blog'] }
);

export async function getBlogCategories(): Promise<string[]> {
  return _getBlogCategories();
}

const _getBlogTags = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blog_posts')
      .select('tags')
      .eq('is_published', true);

    if (error || !data) {
      return [];
    }

    const allTags = data.flatMap((d) => d.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  },
  ['blog-tags'],
  { revalidate: 600, tags: ['blog'] }
);

export async function getBlogTags(): Promise<string[]> {
  return _getBlogTags();
}

export async function getBlogStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('is_published', true);

  if (error || !data) {
    return { total: 0, byCategory: {} };
  }

  const byCategory = data.reduce((acc: Record<string, number>, post) => {
    const cat = post.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: data.length,
    byCategory,
  };
}

export async function incrementBlogViewCount(slug: string): Promise<void> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, view_count')
    .eq('slug', slug)
    .single();

  if (post) {
    await supabase
      .from('blog_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', post.id);
    revalidatePath('/[locale]/blog/[slug]');
  }
}
