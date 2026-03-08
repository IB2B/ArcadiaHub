'use server';

import { createClient, createServiceSupabaseClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { Tables, TablesUpdate } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { validateImageUpload, generateUploadPath } from '@/lib/utils/uploadHelpers';
import { PaginatedResult, ListOptions } from './types';
import { buildPaginatedResult } from '@/lib/utils/pagination';

type Profile = Tables<'profiles'>;

export async function getAdminPartners(options: ListOptions & {
  status?: 'active' | 'inactive' | 'all';
  category?: string;
}): Promise<PaginatedResult<Profile>> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'created_at', sortOrder = 'desc', status = 'all', category } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'PARTNER');

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    const safeSearch = search.replace(/[.,()\[\]]/g, '');
    query = query.or(`company_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,contact_first_name.ilike.%${safeSearch}%,contact_last_name.ilike.%${safeSearch}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching admin partners:', { error });
    return buildPaginatedResult(null, 0, page, pageSize);
  }

  return buildPaginatedResult(data, count, page, pageSize);
}

export async function getAdminPartner(id: string): Promise<Profile | null> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('Error fetching partner:', { error });
    return null;
  }

  return data;
}

export async function createPartner(data: {
  email: string;
  company_name?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
  category?: string | null;
  website?: string | null;
  description?: string | null;
  is_active?: boolean;
  logo_url?: string | null;
}): Promise<{ success: boolean; error?: string; data?: Profile }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createServiceSupabaseClient();

  const tempPassword = `Arcadia${Date.now()}!${Math.random().toString(36).slice(2, 8)}`;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || 'Failed to create auth user' };
  }

  const { data: result, error } = await supabase
    .from('profiles')
    .update({
      company_name: data.company_name || null,
      contact_first_name: data.contact_first_name || null,
      contact_last_name: data.contact_last_name || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      postal_code: data.postal_code || null,
      category: data.category || null,
      website: data.website || null,
      description: data.description || null,
      is_active: data.is_active ?? true,
      logo_url: data.logo_url || null,
    })
    .eq('id', authData.user.id)
    .select()
    .single();

  if (error) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/partners');
  return { success: true, data: result };
}

export async function updatePartner(id: string, data: TablesUpdate<'profiles'>): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/partners');
  revalidatePath('/[locale]/admin/partners/[id]');
  return { success: true };
}

export async function togglePartnerStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  return updatePartner(id, { is_active: isActive });
}

export async function deletePartner(id: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/partners');
  return { success: true };
}

export async function uploadPartnerLogo(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createServiceSupabaseClient();

  const file = formData.get('file') as File;
  const partnerId = formData.get('partnerId') as string;

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' };
  }

  const validation = validateImageUpload(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const path = generateUploadPath(partnerId || 'temp', file.name);

  const { data, error } = await supabase.storage
    .from('partner-logos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    logger.error('Error uploading partner logo:', { error });
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from('partner-logos')
    .getPublicUrl(data.path);

  return { success: true, url: urlData.publicUrl };
}

export async function getPartnerOptions(): Promise<{ value: string; label: string }[]> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('id, company_name, contact_first_name, contact_last_name')
    .eq('role', 'PARTNER')
    .eq('is_active', true)
    .order('company_name');

  return (data || []).map((p) => ({
    value: p.id,
    label: p.company_name || `${p.contact_first_name} ${p.contact_last_name}`.trim() || 'Unknown',
  }));
}

export async function getCategories(): Promise<string[]> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('category')
    .eq('role', 'PARTNER')
    .not('category', 'is', null);

  const categories = new Set<string>();
  data?.forEach((p) => {
    if (p.category) categories.add(p.category);
  });

  return Array.from(categories).sort();
}
