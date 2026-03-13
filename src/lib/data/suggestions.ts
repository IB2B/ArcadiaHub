'use server';

import { createClient, createServiceSupabaseClient } from '@/lib/database/server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/guards';
import { notifyAdminsSuggestionSubmitted, notifySuggestionReply } from '@/lib/services/notificationService';
import { sendSuggestionReplyEmail } from '@/lib/email';

export type SuggestionStatus = 'pending' | 'reviewed' | 'resolved';

export interface Suggestion {
  id: string;
  user_id: string;
  subject: string;
  content: string;
  status: SuggestionStatus;
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    contact_first_name: string | null;
    contact_last_name: string | null;
    company_name: string | null;
    email: string;
  } | null;
}

// ============================================================================
// PARTNER ACTIONS
// ============================================================================

export async function submitSuggestion(data: {
  subject: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { data: result, error } = await supabase
    .from('suggestions')
    .insert({
      user_id: user.id,
      subject: data.subject.trim(),
      content: data.content.trim(),
    })
    .select('id')
    .single();

  if (error) return { success: false, error: error.message };

  // Notify admins (non-blocking)
  notifyAdminsSuggestionSubmitted({ userId: user.id, subject: data.subject }).catch(console.error);

  revalidatePath('/suggestions');
  return { success: true };
}

export async function getMySuggestions(): Promise<Suggestion[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }

  return (data || []) as Suggestion[];
}

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

export async function getAllSuggestions(params: {
  status?: SuggestionStatus | 'all';
  page?: number;
  limit?: number;
} = {}): Promise<{ suggestions: Suggestion[]; total: number }> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return { suggestions: [], total: 0 };
  }

  const { status = 'all', page = 1, limit = 20 } = params;
  const supabase = await createServiceSupabaseClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('suggestions')
    .select('*, author:profiles!suggestions_user_id_fkey(contact_first_name, contact_last_name, company_name, email)', { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching all suggestions:', error);
    return { suggestions: [], total: 0 };
  }

  return { suggestions: (data || []) as Suggestion[], total: count || 0 };
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

  const supabase = await createServiceSupabaseClient();

  // Fetch suggestion first to get user info for notification
  const { data: suggestion } = await supabase
    .from('suggestions')
    .select('user_id, subject, author:profiles!suggestions_user_id_fkey(email, contact_first_name)')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('suggestions')
    .update({
      status,
      admin_reply: adminReply ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  // If admin replied, notify the user (non-blocking)
  if (adminReply && suggestion) {
    const author = Array.isArray(suggestion.author) ? suggestion.author[0] : suggestion.author;
    notifySuggestionReply({
      userId: suggestion.user_id,
      suggestionSubject: suggestion.subject,
      suggestionId: id,
    }).catch(console.error);

    if (author && 'email' in author && author.email) {
      sendSuggestionReplyEmail({
        to: author.email,
        firstName: ('contact_first_name' in author ? author.contact_first_name : null) || 'Partner',
        subject: suggestion.subject,
        reply: adminReply,
        suggestionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/suggestions`,
      }).catch(console.error);
    }
  }

  revalidatePath('/admin/suggestions');
  revalidatePath('/suggestions');
  return { success: true };
}
