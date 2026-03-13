'use server';

import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/services/storage';

type Case = Database['public']['Tables']['cases']['Row'];
type CaseInsert = Database['public']['Tables']['cases']['Insert'];
type CaseUpdate = Database['public']['Tables']['cases']['Update'];
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
    .select('*', { count: 'exact' });

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
    console.error('Error fetching cases:', error);
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
    console.error('Error fetching case:', error);
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
    .select('*', { count: 'exact' })
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
    console.error('Error fetching my cases:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function createCase(
  clientName: string,
  notes?: string
): Promise<{ success: boolean; data?: Case; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: codeData, error: codeError } = await supabase.rpc('next_case_code' as never);
  if (codeError || !codeData) {
    return { success: false, error: 'Failed to generate case code' };
  }
  const caseCode = codeData as string;

  const { data, error } = await supabase
    .from('cases')
    .insert({
      case_code: caseCode,
      partner_id: user.id,
      client_name: clientName,
      notes,
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateCaseStatus(
  caseId: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'SUSPENDED' | 'COMPLETED' | 'CANCELLED'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('cases')
    .update({ status })
    .eq('id', caseId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function uploadCaseDocument(
  caseId: string,
  file: File
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Verify the case belongs to the current user
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('id, case_code, partner_id')
    .eq('id', caseId)
    .eq('partner_id', user.id)
    .single();

  if (caseError || !caseData) return { success: false, error: 'Case not found' };

  const uploadResult = await uploadFile('case-documents', file, `${caseId}`);
  if (!uploadResult.success || !uploadResult.url) {
    return { success: false, error: uploadResult.error || 'Upload failed' };
  }

  const { error } = await supabase.from('case_documents').insert({
    case_id: caseId,
    title: file.name,
    file_url: uploadResult.url,
    file_type: file.type || null,
    uploaded_by: user.id,
  });

  if (error) return { success: false, error: error.message };

  // No notification needed here — partner is uploading their own document.
  // Admin document uploads (which notify the partner) are handled in admin flows.

  revalidatePath(`/[locale]/(dashboard)/cases/${caseId}`, 'page');
  return { success: true };
}

export async function getCaseStats(partnerId?: string): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}> {
  const supabase = await createClient();

  let query = supabase.from('cases').select('status');

  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { total: 0, pending: 0, inProgress: 0, completed: 0 };
  }

  return {
    total: data.length,
    pending: data.filter((c: { status: string | null }) => c.status === 'PENDING').length,
    inProgress: data.filter((c: { status: string | null }) => c.status === 'IN_PROGRESS').length,
    completed: data.filter((c: { status: string | null }) => c.status === 'COMPLETED').length,
  };
}
