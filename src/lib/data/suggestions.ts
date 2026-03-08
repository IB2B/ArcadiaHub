'use server';

import { createClient } from '@/lib/database/server';
import { requireAuth, requireRole, authErrorToResult } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { sendAdminAlertEmail } from '@/lib/email';
import { notifyUserMentioned } from '@/lib/services/notificationService';

export type SuggestionStatus = 'pending' | 'reviewed' | 'resolved';

export interface Suggestion {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: SuggestionStatus;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    company_name: string | null;
    contact_first_name: string | null;
    contact_last_name: string | null;
    email: string;
  } | null;
}

export async function submitSuggestion(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  let userId: string;
  let userEmail: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
    userEmail = ctx.profile.email;
  } catch (err) {
    return authErrorToResult(err);
  }

  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!subject?.trim() || !message?.trim()) {
    return { success: false, error: 'Subject and message are required' };
  }

  const supabase = await createClient();

  const { data: result, error } = await (supabase as any)
    .from('suggestions')
    .insert({
      user_id: userId,
      subject: subject.trim(),
      message: message.trim(),
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    logger.error('Error submitting suggestion:', { error });
    return { success: false, error: error.message };
  }

  sendAdminAlertEmail({
    subject: `New suggestion: ${subject.trim()}`,
    body: `${userEmail} submitted a new suggestion.\n\nSubject: ${subject.trim()}\n\n${message.trim()}`,
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/suggestions`,
  }).catch((e) => logger.error('Failed to send admin alert for suggestion', { error: e }));

  revalidatePath('/[locale]/suggestions');
  return { success: true };
}

export async function getMySuggestions(): Promise<Suggestion[]> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from('suggestions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching suggestions:', { error });
    return [];
  }

  return (data ?? []) as Suggestion[];
}

export async function getAllSuggestions(params: {
  status?: SuggestionStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ suggestions: Suggestion[]; total: number; page: number; totalPages: number }> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return { suggestions: [], total: 0, page: 1, totalPages: 0 };
  }

  const { status = 'all', search = '', page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = (supabase as any)
    .from('suggestions')
    .select('*, profile:profiles(company_name, contact_first_name, contact_last_name, email)', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    const safe = search.replace(/[.,()\[\]]/g, '');
    query = query.or(`subject.ilike.%${safe}%,message.ilike.%${safe}%`);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Error fetching all suggestions:', { error });
    return { suggestions: [], total: 0, page: 1, totalPages: 0 };
  }

  return {
    suggestions: (data ?? []) as Suggestion[],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
  adminReply?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createClient();

  // Get suggestion to notify submitter
  const { data: suggestion } = await (supabase as any)
    .from('suggestions')
    .select('user_id, subject')
    .eq('id', id)
    .single();

  const { error } = await (supabase as any)
    .from('suggestions')
    .update({
      status,
      admin_reply: adminReply ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    logger.error('Error updating suggestion status:', { error });
    return { success: false, error: error.message };
  }

  // Notify submitter if there is an admin reply
  if (adminReply && suggestion?.user_id) {
    notifyUserMentioned({
      mentionedUserId: suggestion.user_id,
      mentionedByName: 'Admin',
      entityType: 'suggestion',
      entityTitle: suggestion.subject,
      entityLink: '/suggestions',
    }).catch((e) => logger.error('Failed to notify suggestion reply', { error: e }));
  }

  revalidatePath('/[locale]/admin/suggestions');
  return { success: true };
}
