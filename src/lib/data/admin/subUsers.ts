'use server';

import { createServiceSupabaseClient, createClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { sendUserInviteEmail } from '@/lib/email';
import { buildPaginatedResult } from '@/lib/utils/pagination';
import { PaginatedResult, ListOptions } from './types';
import { Tables } from '@/types/database.types';

type Profile = Tables<'profiles'>;

export async function createSubUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role?: 'PARTNER' | 'COMMERCIAL';
  assignedCommercialId?: string;
}): Promise<{ success: boolean; error?: string; userId?: string }> {
  let creatorId: string;
  try {
    const ctx = await requireRole(['ADMIN', 'COMMERCIAL']);
    creatorId = ctx.profile.id;
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  // Check if user already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .maybeSingle();

  if (existingProfile) {
    return { success: false, error: 'A user with this email already exists' };
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: {
      first_name: data.firstName,
      last_name: data.lastName,
    },
  });

  if (authError || !authData.user) {
    logger.error('Error creating sub-user:', { error: authError });
    return { success: false, error: authError?.message || 'Failed to create user account' };
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email: data.email,
    role: data.role || 'PARTNER',
    contact_first_name: data.firstName,
    contact_last_name: data.lastName,
    is_active: true,
    created_by: creatorId,
    assigned_commercial_id: data.assignedCommercialId || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (profileError) {
    logger.error('Error creating profile for sub-user:', { error: profileError });
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: 'Failed to create user profile' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: data.email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (linkError) {
    logger.error('Error generating invite link:', { error: linkError });
  }

  if (linkData?.properties?.action_link) {
    sendUserInviteEmail({
      to: data.email,
      firstName: data.firstName,
      setupUrl: linkData.properties.action_link,
    }).catch((e) => logger.error('Failed to send invite email', { error: e }));
  }

  revalidatePath('/[locale]/admin/partners');
  return { success: true, userId };
}

export async function getSubUsers(options: ListOptions = {}): Promise<PaginatedResult<Profile>> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return buildPaginatedResult(null, 0, 1, 10);
  }

  const supabase = await createClient();
  const { page = 1, pageSize = 10, search } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('profiles').select('*', { count: 'exact' });

  if (search) {
    const safe = search.replace(/[.,()\[\]]/g, '');
    query = query.or(
      `company_name.ilike.%${safe}%,contact_first_name.ilike.%${safe}%,contact_last_name.ilike.%${safe}%,email.ilike.%${safe}%`
    );
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching sub-users:', { error });
    return buildPaginatedResult(null, 0, page, pageSize);
  }

  return buildPaginatedResult(data, count, page, pageSize);
}

export async function deactivateSubUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '87600h',
  });

  if (authError) {
    logger.error('Error banning user:', { error: authError });
  }

  revalidatePath('/[locale]/admin/partners');
  return { success: true };
}

export async function reactivateSubUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  });

  if (authError) {
    logger.error('Error unbanning user:', { error: authError });
  }

  revalidatePath('/[locale]/admin/partners');
  return { success: true };
}

export async function resendInviteEmail(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireRole(['ADMIN', 'COMMERCIAL']);
  } catch {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = await createServiceSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, contact_first_name')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { success: false, error: 'User not found' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: profile.email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    logger.error('Error generating invite link:', { error: linkError });
    return { success: false, error: 'Failed to generate invite link' };
  }

  const result = await sendUserInviteEmail({
    to: profile.email,
    firstName: profile.contact_first_name ?? '',
    setupUrl: linkData.properties.action_link,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
