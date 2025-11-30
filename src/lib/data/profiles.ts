'use server';

import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
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
    .select('*', { count: 'exact' })
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
    console.error('Error fetching partners:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function searchPartners(searchTerm: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'PARTNER')
    .eq('is_active', true)
    .or(`company_name.ilike.%${searchTerm}%,contact_first_name.ilike.%${searchTerm}%,contact_last_name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
    .limit(20);

  if (error) {
    console.error('Error searching partners:', error);
    return [];
  }

  return data || [];
}
