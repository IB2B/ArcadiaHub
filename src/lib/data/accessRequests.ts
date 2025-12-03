'use server';

import { createServiceSupabaseClient, getCurrentProfile } from '@/lib/database/server';
import { notifyAdminsAccessRequestSubmitted } from '@/lib/services/notificationService';
import { sendPartnerWelcomeEmail } from '@/lib/email';

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
    first_name: string;
    last_name: string;
  } | null;
}

export interface AccessRequestData {
  // Personal
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  contact_description: string;
  contact_photo_url?: string;
  // Company
  company_name: string;
  legal_address: string;
  operational_address: string;
  business_phone: string;
  generic_email: string;
  pec: string;
  company_description: string;
  company_logo_url?: string;
}

export interface SubmitAccessRequestResult {
  success: boolean;
  error?: string;
  requestId?: string;
}

/**
 * Submit an access request (public - no auth required)
 */
export async function submitAccessRequest(
  data: AccessRequestData
): Promise<SubmitAccessRequestResult> {
  try {
    // Use service client to bypass RLS (this is a public form)
    const supabase = await createServiceSupabaseClient();

    const { data: result, error } = await supabase
      .from('access_requests')
      .insert({
        contact_first_name: data.contact_first_name,
        contact_last_name: data.contact_last_name,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        contact_description: data.contact_description,
        contact_photo_url: data.contact_photo_url || null,
        company_name: data.company_name,
        legal_address: data.legal_address,
        operational_address: data.operational_address,
        business_phone: data.business_phone,
        generic_email: data.generic_email,
        pec: data.pec,
        company_description: data.company_description,
        company_logo_url: data.company_logo_url || null,
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error submitting access request:', error);
      return { success: false, error: error.message };
    }

    // Notify admins about the new access request
    try {
      await notifyAdminsAccessRequestSubmitted({
        id: result.id,
        company_name: data.company_name,
        contact_email: data.contact_email,
        contact_first_name: data.contact_first_name,
        contact_last_name: data.contact_last_name,
      });
    } catch (notifyError) {
      // Don't fail the request if notification fails
      console.error('Error sending notification:', notifyError);
    }

    return { success: true, requestId: result.id };
  } catch (error) {
    console.error('Error submitting access request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit request',
    };
  }
}

/**
 * Upload a file for access request (public - uses service client to bypass RLS)
 * Accepts FormData because File objects can't be passed directly to server actions
 */
export async function uploadAccessRequestFile(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'photo' | 'logo';

    if (!file || file.size === 0) {
      return { success: false, error: 'No file provided' };
    }

    // Use service client to bypass storage RLS
    const supabase = await createServiceSupabaseClient();

    const folder = type === 'photo' ? 'contact-photos' : 'company-logos';
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${timestamp}-${sanitizedName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from('access-requests')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }

    // Get public URL (bucket must be set to public in Supabase)
    const { data: urlData } = supabase.storage
      .from('access-requests')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

// ============================================
// Admin Functions
// ============================================

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

/**
 * Get access requests with filtering and pagination (admin only)
 */
export async function getAccessRequests(
  params: GetAccessRequestsParams = {}
): Promise<GetAccessRequestsResult> {
  const { status = 'ALL', page = 1, limit = 10, search = '' } = params;

  const profile = await getCurrentProfile();
  if (!profile || !['ADMIN', 'COMMERCIAL'].includes(profile.role)) {
    return { requests: [], total: 0, page: 1, totalPages: 0 };
  }

  const supabase = await createServiceSupabaseClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from('access_requests')
    .select('*', { count: 'exact' });

  // Filter by status
  if (status !== 'ALL') {
    query = query.eq('status', status);
  }

  // Search by name, email, or company
  if (search) {
    query = query.or(
      `contact_first_name.ilike.%${search}%,contact_last_name.ilike.%${search}%,contact_email.ilike.%${search}%,company_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching access requests:', error);
    return { requests: [], total: 0, page: 1, totalPages: 0 };
  }

  return {
    requests: (data || []) as AccessRequest[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get a single access request by ID (admin only)
 */
export async function getAccessRequest(id: string): Promise<AccessRequest | null> {
  const profile = await getCurrentProfile();
  if (!profile || !['ADMIN', 'COMMERCIAL'].includes(profile.role)) {
    return null;
  }

  const supabase = await createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching access request:', error);
    return null;
  }

  // Fetch reviewer info if reviewed
  let reviewer = null;
  if (data.reviewed_by) {
    const { data: reviewerData } = await supabase
      .from('profiles')
      .select('first_name, last_name')
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

/**
 * Get count of pending access requests (for admin dashboard)
 */
export async function getPendingAccessRequestsCount(): Promise<number> {
  const profile = await getCurrentProfile();
  if (!profile || !['ADMIN', 'COMMERCIAL'].includes(profile.role)) {
    return 0;
  }

  const supabase = await createServiceSupabaseClient();

  const { count, error } = await supabase
    .from('access_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING');

  if (error) {
    console.error('Error counting pending requests:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Approve an access request (admin only)
 * This will:
 * 1. Create a Supabase Auth user
 * 2. Create a partner profile
 * 3. Send a welcome email with password setup link
 * 4. Mark the request as approved
 */
export async function approveAccessRequest(
  id: string,
  notes?: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  const adminProfile = await getCurrentProfile();
  if (!adminProfile || adminProfile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  // 1. Fetch the access request
  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !request) {
    console.error('Error fetching access request:', fetchError);
    return { success: false, error: 'Access request not found' };
  }

  // Check if already processed
  if (request.status !== 'PENDING') {
    return { success: false, error: 'Request has already been processed' };
  }

  // 2. Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(
    (u) => u.email?.toLowerCase() === request.contact_email.toLowerCase()
  );

  if (existingUser) {
    return { success: false, error: 'A user with this email already exists' };
  }

  // 3. Create the Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: request.contact_email,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      first_name: request.contact_first_name,
      last_name: request.contact_last_name,
      company_name: request.company_name,
    },
  });

  if (authError || !authData.user) {
    console.error('Error creating auth user:', authError);
    return { success: false, error: authError?.message || 'Failed to create user account' };
  }

  const userId = authData.user.id;

  // 4. Create or update the partner profile (upsert in case trigger already created it)
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
    console.error('Error creating profile:', profileError);
    // Rollback: delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: 'Failed to create partner profile' };
  }

  // 5. Mark the request as approved
  const { error: updateError } = await supabase
    .from('access_requests')
    .update({
      status: 'APPROVED',
      reviewed_by: adminProfile.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating access request:', updateError);
    // Don't rollback user creation, just log the error
  }

  // 6. Generate password reset link and send welcome email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: request.contact_email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (linkError) {
    console.error('Error generating recovery link:', linkError);
    // Don't fail - user can use "forgot password" later
  }

  // 7. Send branded welcome email
  if (linkData?.properties?.action_link) {
    const emailResult = await sendPartnerWelcomeEmail({
      to: request.contact_email,
      firstName: request.contact_first_name,
      companyName: request.company_name,
      loginUrl: linkData.properties.action_link,
    });

    if (!emailResult.success) {
      console.error('Error sending welcome email:', emailResult.error);
      // Don't fail - user can use "forgot password" later
    }
  }

  return { success: true, userId };
}

/**
 * Reject an access request (admin only)
 * This will:
 * 1. Mark the request as rejected
 * 2. Send a rejection notification email
 */
export async function rejectAccessRequest(
  id: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const adminProfile = await getCurrentProfile();
  if (!adminProfile || adminProfile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  // 1. Fetch the access request
  const { data: request, error: fetchError } = await supabase
    .from('access_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !request) {
    console.error('Error fetching access request:', fetchError);
    return { success: false, error: 'Access request not found' };
  }

  // Check if already processed
  if (request.status !== 'PENDING') {
    return { success: false, error: 'Request has already been processed' };
  }

  // 2. Mark the request as rejected
  const { error: updateError } = await supabase
    .from('access_requests')
    .update({
      status: 'REJECTED',
      reviewed_by: adminProfile.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error rejecting access request:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Delete an access request (admin only)
 */
export async function deleteAccessRequest(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  const { error } = await supabase
    .from('access_requests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting access request:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
