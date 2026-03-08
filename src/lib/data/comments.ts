'use server';

import { createClient } from '@/lib/database/server';
import { requireAuth, authErrorToResult } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { notifyUserMentioned } from '@/lib/services/notificationService';
import { sendCommentMentionEmail } from '@/lib/email';

export interface Comment {
  id: string;
  entity_type: string;
  entity_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  mentions: string[];
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  author?: {
    id: string;
    contact_first_name: string | null;
    contact_last_name: string | null;
    company_name: string | null;
    logo_url: string | null;
  } | null;
}

function getEntityPath(entityType: string, entityId: string): string {
  const paths: Record<string, string> = {
    case: `/cases/${entityId}`,
    blog_post: `/blog/${entityId}`,
    event: `/events/${entityId}`,
    academy_content: `/academy/${entityId}`,
  };
  return paths[entityType] ?? `/${entityType}/${entityId}`;
}

export async function getComments(
  entityType: string,
  entityId: string,
  page: number = 1
): Promise<{ comments: Comment[]; total: number; totalPages: number }> {
  const supabase = await createClient();
  const limit = 20;
  const offset = (page - 1) * limit;

  const { data, count, error } = await (supabase as any)
    .from('comments')
    .select('*, author:profiles(id, contact_first_name, contact_last_name, company_name, logo_url)', { count: 'exact' })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Error fetching comments:', { error });
    return { comments: [], total: 0, totalPages: 0 };
  }

  return {
    comments: (data ?? []) as Comment[],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getCommentCount(entityType: string, entityId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await (supabase as any)
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) return 0;
  return count ?? 0;
}

export async function createComment(data: {
  entityType: string;
  entityId: string;
  content: string;
  parentId?: string;
  mentions?: string[];
}): Promise<{ success: boolean; error?: string; comment?: Comment }> {
  let userId: string;
  let authorName: string;
  let authorEmail: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
    const firstName = ctx.profile.contact_first_name ?? '';
    const lastName = ctx.profile.contact_last_name ?? '';
    authorName = `${firstName} ${lastName}`.trim() || ctx.profile.company_name || ctx.profile.email;
    authorEmail = ctx.profile.email;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  const { data: result, error } = await (supabase as any)
    .from('comments')
    .insert({
      entity_type: data.entityType,
      entity_id: data.entityId,
      author_id: userId,
      content: data.content,
      parent_id: data.parentId ?? null,
      mentions: data.mentions ?? [],
    })
    .select('*, author:profiles(id, contact_first_name, contact_last_name, company_name, logo_url)')
    .single();

  if (error) {
    logger.error('Error creating comment:', { error });
    return { success: false, error: error.message };
  }

  // Notify and email mentioned users
  if (data.mentions && data.mentions.length > 0) {
    const entityPath = getEntityPath(data.entityType, data.entityId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

    // Fetch entity title for notification
    let entityTitle = data.entityId;
    try {
      const tableMap: Record<string, string> = {
        case: 'cases',
        blog_post: 'blog_posts',
        event: 'events',
        academy_content: 'academy_content',
      };
      const tableName = tableMap[data.entityType];
      if (tableName) {
        const titleCol = data.entityType === 'case' ? 'case_code' : 'title';
        const { data: entity } = await supabase.from(tableName as any).select(titleCol).eq('id', data.entityId).single();
        if (entity) entityTitle = (entity as any)[titleCol] ?? data.entityId;
      }
    } catch {
      // fallback to entityId
    }

    for (const mentionedUserId of data.mentions) {
      notifyUserMentioned({
        mentionedUserId,
        mentionedByName: authorName,
        entityType: data.entityType,
        entityTitle,
        entityLink: entityPath,
      }).catch((e) => logger.error('Failed to notify mention', { error: e }));

      // Send email if pref allows (fire-and-forget)
      const mentionedId = mentionedUserId;
      const contentPreview = data.content.length > 100 ? data.content.slice(0, 100) + '…' : data.content;
      const entityTypeCopy = data.entityType;
      const entityTitleCopy = entityTitle;
      const commentUrlCopy = `${appUrl}${entityPath}`;
      Promise.resolve().then(async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, contact_first_name, notification_preferences')
            .eq('id', mentionedId)
            .single();
          if (!profile) return;
          const prefs = (profile.notification_preferences as Record<string, boolean> | null) ?? {};
          if (prefs.email_mentions === false) return;
          await sendCommentMentionEmail({
            to: profile.email,
            firstName: profile.contact_first_name ?? '',
            mentionedBy: authorName,
            entityType: entityTypeCopy,
            entityTitle: entityTitleCopy,
            commentPreview: contentPreview,
            commentUrl: commentUrlCopy,
          });
        } catch (e) {
          logger.error('Failed to send mention email', { error: e });
        }
      });
    }
  }

  const entityPath = getEntityPath(data.entityType, data.entityId);
  revalidatePath(`/[locale]${entityPath}`);
  return { success: true, comment: result as Comment };
}

export async function updateComment(
  id: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  const { error } = await (supabase as any)
    .from('comments')
    .update({
      content,
      is_edited: true,
      edited_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('author_id', userId);

  if (error) {
    logger.error('Error updating comment:', { error });
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteComment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  // Check if comment has children
  const { count: childCount } = await (supabase as any)
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', id);

  if (childCount && childCount > 0) {
    // Soft delete if has children
    const { error } = await (supabase as any)
      .from('comments')
      .update({ content: '[deleted]', is_edited: true, edited_at: new Date().toISOString() })
      .eq('id', id)
      .eq('author_id', userId);

    if (error) return { success: false, error: error.message };
  } else {
    // Hard delete leaf node
    const { error } = await (supabase as any)
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('author_id', userId);

    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}
