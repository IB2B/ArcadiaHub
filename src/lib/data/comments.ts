'use server';

import { createClient } from '@/lib/database/server';
import { notifyUserMentioned } from '@/lib/services/notificationService';

export type EntityType = 'case' | 'blog_post' | 'event' | 'academy_content';

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  entity_type: EntityType;
  entity_id: string;
  parent_id: string | null;
  mentions: string[];
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    contact_first_name: string | null;
    contact_last_name: string | null;
    company_name: string | null;
    logo_url: string | null;
    role: string;
  } | null;
  replies?: Comment[];
}

export async function getComments(
  entityType: EntityType,
  entityId: string
): Promise<Comment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments')
    .select('*, author:profiles!comments_author_id_fkey(id, contact_first_name, contact_last_name, company_name, logo_url, role)')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  const topLevel = (data || []) as Comment[];

  // Fetch replies for all top-level comments
  if (topLevel.length > 0) {
    const ids = topLevel.map(c => c.id);
    const { data: replies } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(id, contact_first_name, contact_last_name, company_name, logo_url, role)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .in('parent_id', ids)
      .order('created_at', { ascending: true });

    const repliesMap = new Map<string, Comment[]>();
    for (const reply of (replies || []) as Comment[]) {
      if (!reply.parent_id) continue;
      if (!repliesMap.has(reply.parent_id)) repliesMap.set(reply.parent_id, []);
      repliesMap.get(reply.parent_id)!.push(reply);
    }

    for (const comment of topLevel) {
      comment.replies = repliesMap.get(comment.id) || [];
    }
  }

  return topLevel;
}

export async function getCommentCount(
  entityType: EntityType,
  entityId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) return 0;
  return count || 0;
}

export async function createComment(data: {
  content: string;
  entityType: EntityType;
  entityId: string;
  parentId?: string;
  mentions?: string[];
}): Promise<{ success: boolean; error?: string; comment?: Comment }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: result, error } = await supabase
    .from('comments')
    .insert({
      content: data.content.trim(),
      author_id: user.id,
      entity_type: data.entityType,
      entity_id: data.entityId,
      parent_id: data.parentId || null,
      mentions: data.mentions || [],
    })
    .select('*, author:profiles!comments_author_id_fkey(id, contact_first_name, contact_last_name, company_name, logo_url, role)')
    .single();

  if (error) return { success: false, error: error.message };

  // Notify mentioned users (non-blocking)
  if (data.mentions && data.mentions.length > 0) {
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('contact_first_name, contact_last_name, company_name')
      .eq('id', user.id)
      .single();

    const authorName = authorProfile
      ? `${authorProfile.contact_first_name || ''} ${authorProfile.contact_last_name || ''}`.trim() || authorProfile.company_name || 'Someone'
      : 'Someone';

    // Resolve entity title + link for the notification
    let entityTitle = '';
    let entityLink = '';
    if (data.entityType === 'case') {
      const { data: caseRow } = await supabase.from('cases').select('case_code').eq('id', data.entityId).single();
      entityTitle = caseRow?.case_code || '';
      entityLink = `/cases/${data.entityId}`;
    } else if (data.entityType === 'blog_post') {
      const { data: post } = await supabase.from('blog_posts').select('title, slug').eq('id', data.entityId).single();
      entityTitle = post?.title || '';
      entityLink = `/blog/${post?.slug || data.entityId}`;
    } else if (data.entityType === 'event') {
      const { data: event } = await supabase.from('events').select('title').eq('id', data.entityId).single();
      entityTitle = event?.title || '';
      entityLink = `/events/${data.entityId}`;
    } else if (data.entityType === 'academy_content') {
      const { data: content } = await supabase.from('academy_content').select('title').eq('id', data.entityId).single();
      entityTitle = content?.title || '';
      entityLink = `/academy/${data.entityId}`;
    }

    const commentPreview = data.content.trim().slice(0, 80) + (data.content.trim().length > 80 ? '…' : '');

    for (const mentionedUserId of data.mentions) {
      if (mentionedUserId !== user.id) {
        notifyUserMentioned({
          mentionedUserId,
          authorName,
          entityType: data.entityType,
          entityTitle,
          entityLink,
          commentId: result.id,
          commentPreview,
        }).catch(console.error);
      }
    }
  }

  return { success: true, comment: result as Comment };
}

export async function updateComment(
  id: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('comments')
    .update({
      content: content.trim(),
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('author_id', user.id); // Only author can edit

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function deleteComment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // RLS policy enforces: author or admin can delete
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

/**
 * Search users for @mention autocomplete
 */
export async function searchUsersForMention(query: string): Promise<Array<{
  id: string;
  name: string;
  company: string | null;
}>> {
  if (!query || query.length < 1) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, contact_first_name, contact_last_name, company_name')
    .or(`contact_first_name.ilike.%${query}%,contact_last_name.ilike.%${query}%,company_name.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(8);

  if (error || !data) return [];

  return data.map(p => ({
    id: p.id,
    name: `${p.contact_first_name || ''} ${p.contact_last_name || ''}`.trim() || p.company_name || p.id,
    company: p.company_name,
  }));
}
