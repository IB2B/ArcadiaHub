'use server';

import { createClient } from '@/lib/database/server';
import { requireAuth, authErrorToResult } from '@/lib/auth/guards';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';
import { validateImageUpload, generateUploadPath } from '@/lib/utils/uploadHelpers';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, company_name, logo_url, contact_first_name, contact_last_name, phone, address, city, region, country, postal_code, category, website, description, social_links, tags, is_active, notification_preferences, assigned_commercial_id, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    logger.error('Error fetching profile:', { error });
    return null;
  }

  return data;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  return getProfile(user.id);
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/profile');
  return { success: true };
}

export async function getPartners(options?: {
  category?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Profile[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select('id, email, role, company_name, logo_url, contact_first_name, contact_last_name, phone, address, city, region, country, postal_code, category, website, description, social_links, tags, is_active, notification_preferences, assigned_commercial_id, created_at, updated_at', { count: 'exact' })
    .eq('role', 'PARTNER');

  if (options?.category) {
    query = query.eq('category', options.category);
  }
  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }
  if (options?.search) {
    query = query.or(`company_name.ilike.%${options.search}%,contact_first_name.ilike.%${options.search}%,contact_last_name.ilike.%${options.search}%,city.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('company_name', { ascending: true });

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching partners:', { error });
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function searchPartners(searchTerm: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, company_name, logo_url, contact_first_name, contact_last_name, phone, address, city, region, country, postal_code, category, website, description, social_links, tags, is_active, notification_preferences, assigned_commercial_id, created_at, updated_at')
    .eq('role', 'PARTNER')
    .eq('is_active', true)
    .or(`company_name.ilike.%${searchTerm}%,contact_first_name.ilike.%${searchTerm}%,contact_last_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
    .limit(20);

  if (error) {
    logger.error('Error searching partners:', { error });
    return [];
  }

  return data || [];
}

/**
 * Update current user's profile
 */
export async function updateCurrentUserProfile(
  updates: ProfileUpdate
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
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/profile');
  return { success: true };
}

/**
 * Upload logo for current user's profile
 */
export async function uploadProfileLogo(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  let userId: string;
  try {
    const ctx = await requireAuth();
    userId = ctx.userId;
  } catch (err) {
    return authErrorToResult(err);
  }

  const supabase = await createClient();
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' };
  }

  const validation = validateImageUpload(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const path = generateUploadPath(userId, file.name);

  const { data, error } = await supabase.storage
    .from('partner-logos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    logger.error('Error uploading profile logo:', { error });
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('partner-logos')
    .getPublicUrl(data.path);

  // Update profile with new logo URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ logo_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) {
    logger.error('Error updating profile with logo:', { error: updateError });
    return { success: false, error: updateError.message };
  }

  revalidatePath('/[locale]/profile');
  return { success: true, url: urlData.publicUrl };
}
