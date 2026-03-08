'use server';

import { createServiceSupabaseClient, createServerSupabaseClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { notifyAdminsAccessRequestSubmitted } from '@/lib/services/notificationService';
import { sendPartnerWelcomeEmail, sendAccessRequestRejectionEmail } from '@/lib/email';

export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccessRequest {
  id: string;
  status: AccessRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  contact_description: string;
  contact_photo_url: string | null;
  company_name: string;
  legal_address: string;
  operational_address: string;
  business_phone: string;
  generic_email: string;
  pec: string;
  company_description: string;
  company_logo_url: string | null;
  created_at: string;
  updated_at: string;
  reviewer?: {
    contact_first_name: string;
    contact_last_name: string;
  } | null;
}

export interface GetAccessRequestsParams {
  status?: AccessRequestStatus | 'ALL';
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetAccessRequestsResult {
  requests: AccessRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAccessRequests(
  params: GetAccessRequestsParams = {}
): Promise<GetAccessRequestsResult> {
  const { status = 'ALL', page = 1, limit = 10, search = '' } = params;

  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return { requests: [], total: 0, page: 1, totalPages: 0 };
  }

  const supabase = await createServerSupabaseClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('access_requests')
    .select('*', { count: 'exact' });

  if (status !== 'ALL') {
    query = query.eq('status', status);
  }

  if (search) {
    const safeSearch = search.replace(/[.,()\[\]]/g, '');
    query = query.or(
      `contact_first_name.ilike.%${safeSearch}%,contact_last_name.ilike.%${safeSearch}%,contact_email.ilike.%${safeSearch}%,company_name.ilike.%${safeSearch}%`
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Error fetching access requests:', { error });
    return { requests: [], total: 0, page: 1, totalPages: 0 };
  }

  return {
    requests: (data || []) as AccessRequest[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getAccessRequest(id: string): Promise<AccessRequest | null> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('Error fetching access request:', { error });
    return null;
  }

  let reviewer = null;
  if (data.reviewed_by) {
    const { data: reviewerData } = await supabase
      .from('profiles')
      .select('contact_first_name, contact_last_name')
      .eq('id', data.reviewed_by)
      .single();
    reviewer = reviewerData;
  }

  return {
    ...data,
    status: data.status as AccessRequestStatus,
    reviewer,
  } as AccessRequest;
}

export async function getPendingAccessRequestsCount(): Promise<number> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return 0;
  }

  const supabase = await createServerSupabaseClient();

  const { count, error } = await supabase
    .from('access_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING');

  if (error) {
    logger.error('Error counting pending requests:', { error });
    return 0;
  }

  return count || 0;
}

export async function approveAccessRequest(
  id: string,
  notes?: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  let adminProfileId: string;
  try {
    const ctx = await requireRole(['ADMIN']);
    adminProfileId = ctx.profile.id;
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !request) {
    logger.error('Error fetching access request:', { error: fetchError });
    return { success: false, error: 'Access request not found' };
  }

  if (request.status !== 'PENDING') {
    return { success: false, error: 'Request has already been processed' };
  }

  // Check if user already exists via profiles table (targeted query, avoids listUsers)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', request.contact_email)
    .maybeSingle();

  if (existingProfile) {
    return { success: false, error: 'A user with this email already exists' };
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: request.contact_email,
    email_confirm: true,
    user_metadata: {
      first_name: request.contact_first_name,
      last_name: request.contact_last_name,
      company_name: request.company_name,
    },
  });

  if (authError || !authData.user) {
    logger.error('Error creating auth user:', { error: authError });
    return { success: false, error: authError?.message || 'Failed to create user account' };
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email: request.contact_email,
    role: 'PARTNER',
    company_name: request.company_name,
    logo_url: request.company_logo_url,
    contact_first_name: request.contact_first_name,
    contact_last_name: request.contact_last_name,
    phone: request.contact_phone,
    address: request.operational_address,
    description: request.company_description,
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (profileError) {
    logger.error('Error creating profile:', { error: profileError });
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: 'Failed to create partner profile' };
  }

  const { error: updateError } = await supabase
    .from('access_requests')
    .update({
      status: 'APPROVED',
      reviewed_by: adminProfileId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq('id', id);

  if (updateError) {
    logger.error('Error updating access request:', { error: updateError });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: request.contact_email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (linkError) {
    logger.error('Error generating recovery link:', { error: linkError });
  }

  if (linkData?.properties?.action_link) {
    const emailResult = await sendPartnerWelcomeEmail({
      to: request.contact_email,
      firstName: request.contact_first_name,
      companyName: request.company_name,
      loginUrl: linkData.properties.action_link,
    });

    if (!emailResult.success) {
      logger.error('Error sending welcome email:', { error: emailResult.error });
    }
  }

  revalidatePath('/[locale]/admin/access-requests');
  return { success: true, userId };
}

export async function rejectAccessRequest(
  id: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  let adminProfileId: string;
  try {
    const ctx = await requireRole(['ADMIN']);
    adminProfileId = ctx.profile.id;
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServerSupabaseClient();

  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !request) {
    logger.error('Error fetching access request:', { error: fetchError });
    return { success: false, error: 'Access request not found' };
  }

  if (request.status !== 'PENDING') {
    return { success: false, error: 'Request has already been processed' };
  }

  const { error: updateError } = await supabase
    .from('access_requests')
    .update({
      status: 'REJECTED',
      reviewed_by: adminProfileId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq('id', id);

  if (updateError) {
    logger.error('Error rejecting access request:', { error: updateError });
    return { success: false, error: updateError.message };
  }

  sendAccessRequestRejectionEmail({
    to: request.contact_email,
    firstName: request.contact_first_name,
    companyName: request.company_name,
    reviewNotes: notes,
  }).catch((e) => logger.error('Failed to send rejection email', { error: e }));

  revalidatePath('/[locale]/admin/access-requests');
  return { success: true };
}

export async function deleteAccessRequest(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['ADMIN']);
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('access_requests')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error deleting access request:', { error });
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/access-requests');
  return { success: true };
}
