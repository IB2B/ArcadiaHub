'use server';

import { createClient } from '@/lib/database/server';
import { requireAuth, requireRole, authErrorToResult } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export async function getMyNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<Notification[]> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch {
    return [];
  }

  const supabase = await createClient();

  let query = supabase
    .from('notifications')
    .select('id, user_id, title, message, type, link, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('is_read', false);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching notifications:', { error });
    return [];
  }

  return data || [];
}

export async function getUnreadCount(): Promise<number> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch {
    return 0;
  }

  const supabase = await createClient();

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    logger.error('Error fetching unread count:', { error });
    return 0;
  }

  return count || 0;
}

export async function markAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/notifications');
  return { success: true };
}

export async function markAllAsRead(): Promise<{ success: boolean; error?: string }> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/notifications');
  return { success: true };
}

export async function createNotification(
  userId: string,
  notification: Omit<NotificationInsert, 'user_id'>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      user_id: userId,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/notifications');
  return { success: true };
}
