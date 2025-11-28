'use server';

import { createClient } from '@/lib/database/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const companyName = formData.get('companyName') as string;
  const contactFirstName = formData.get('firstName') as string;
  const contactLastName = formData.get('lastName') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: companyName,
        contact_first_name: contactFirstName,
        contact_last_name: contactLastName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Update the profile with additional info
  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        company_name: companyName,
        contact_first_name: contactFirstName,
        contact_last_name: contactLastName,
      })
      .eq('id', data.user.id);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
