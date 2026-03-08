'use server';

import { createClient } from '@/lib/database/server';
import { requireAuth, requireRole, authErrorToResult } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';
import { CreateCaseSchema, UpdateCaseStatusSchema } from '@/lib/validators';
import { sendCaseDocumentAddedEmail } from '@/lib/email';

type Case = Database['public']['Tables']['cases']['Row'];
type CaseDocument = Database['public']['Tables']['case_documents']['Row'];
type CaseHistory = Database['public']['Tables']['case_history']['Row'];

export type CaseWithDetails = Case & {
  documents?: CaseDocument[];
  history?: CaseHistory[];
};

export async function getCases(options?: {
  status?: string;
  partnerId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Case[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('cases')
    .select('id, case_code, partner_id, client_name, status, notes, opened_at, closed_at, created_at, updated_at', { count: 'exact' });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.partnerId) {
    query = query.eq('partner_id', options.partnerId);
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
    logger.error('Error fetching cases:', { error });
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getMyCase(caseId: string): Promise<CaseWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      documents:case_documents(*),
      history:case_history(*)
    `)
    .eq('id', caseId)
    .single();

  if (error) {
    logger.error('Error fetching case:', { error });
    return null;
  }

  return data as unknown as CaseWithDetails;
}

export async function getMyCases(options?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Case[]; count: number }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0 };

  let query = supabase
    .from('cases')
    .select('id, case_code, partner_id, client_name, status, notes, opened_at, closed_at, created_at, updated_at', { count: 'exact' })
    .eq('partner_id', user.id);

  if (options?.search) {
    query = query.or(`case_code.ilike.%${options.search}%,client_name.ilike.%${options.search}%`);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
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
    logger.error('Error fetching my cases:', { error });
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function createCase(
  clientName: string,
  notes?: string
): Promise<{ success: boolean; data?: Case; error?: string }> {
  const parsed = CreateCaseSchema.safeParse({ clientName, notes });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: codeData, error: codeError } = await (supabase as any).rpc('next_case_code');
  if (codeError || !codeData) throw new Error('Failed to generate case code');
  const caseCode = codeData as string;

  const { data, error } = await supabase
    .from('cases')
    .insert({
      case_code: caseCode,
      partner_id: userId,
      client_name: parsed.data.clientName,
      notes: parsed.data.notes,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/cases');
  return { success: true, data };
}

export async function updateCaseStatus(
  caseId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'SUSPENDED' | 'COMPLETED' | 'CANCELLED'
): Promise<{ success: boolean; error?: string }> {
  const parsed = UpdateCaseStatusSchema.safeParse({ caseId, status });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  let userId: string;
  let role: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
    role = ctx.profile.role;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();

  // Non-admin users may only update cases they own
  if (role !== 'ADMIN' && role !== 'COMMERCIAL') {
    const { data: caseData } = await supabase
      .from('cases')
      .select('partner_id')
      .eq('id', parsed.data.caseId)
      .single();
    if (caseData?.partner_id !== userId) {
      return { success: false, error: 'Unauthorized' };
    }
  }

  const { error } = await supabase
    .from('cases')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.caseId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/cases');
  revalidatePath('/[locale]/cases/[id]');
  return { success: true };
}

export async function uploadCaseDocument(
  caseId: string,
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch (err) {
    return authErrorToResult(err);
  }

  const file = formData.get('file') as File;
  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' };
  }

  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Allowed: PDF, DOC, DOCX, images.' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: 'File too large. Maximum size is 10MB.' };
  }

  const supabase = await createClient();

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${caseId}/${timestamp}-${sanitizedName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('case-documents')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    logger.error('Error uploading case document:', { error: uploadError });
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from('case-documents')
    .getPublicUrl(uploadData.path);

  const { error: insertError } = await supabase
    .from('case_documents')
    .insert({
      case_id: caseId,
      title: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      uploaded_by: userId,
    });

  if (insertError) {
    logger.error('Error inserting case document record:', { error: insertError });
    return { success: false, error: insertError.message };
  }

  revalidatePath('/[locale]/cases/[id]', 'page');

  // Notify partner by email (fire-and-forget)
  const documentTitle = file.name;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  Promise.resolve().then(async () => {
    try {
      const supabaseForEmail = await createClient();
      const { data: caseRow } = await supabaseForEmail
        .from('cases')
        .select('case_code, partner_id')
        .eq('id', caseId)
        .single();
      if (!caseRow?.partner_id) return;
      const { data: partner } = await supabaseForEmail
        .from('profiles')
        .select('email, contact_first_name, notification_preferences')
        .eq('id', caseRow.partner_id)
        .single();
      if (!partner) return;
      const prefs = (partner.notification_preferences as Record<string, boolean> | null) ?? {};
      if (prefs.email_case_updates === false) return;
      await sendCaseDocumentAddedEmail({
        to: partner.email,
        firstName: partner.contact_first_name ?? '',
        caseCode: caseRow.case_code,
        documentTitle,
        caseUrl: `${appUrl}/cases/${caseId}`,
      });
    } catch (e) {
      logger.error('Failed to send case document email', { error: e });
    }
  });

  return { success: true, url: urlData.publicUrl };
}

export async function getCaseStats(partnerId?: string): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}> {
  const supabase = await createClient();

  // Use parallel COUNT queries with server-side filtering — avoids fetching all rows
  const baseQuery = () => {
    const q = supabase.from('cases').select('*', { count: 'exact', head: true });
    return partnerId ? q.eq('partner_id', partnerId) : q;
  };

  const [totalRes, pendingRes, inProgressRes, completedRes] = await Promise.all([
    baseQuery(),
    baseQuery().eq('status', 'PENDING'),
    baseQuery().eq('status', 'IN_PROGRESS'),
    baseQuery().eq('status', 'COMPLETED'),
  ]);

  return {
    total: totalRes.count ?? 0,
    pending: pendingRes.count ?? 0,
    inProgress: inProgressRes.count ?? 0,
    completed: completedRes.count ?? 0,
  };
}
