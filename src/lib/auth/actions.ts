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

export async function forgotPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Validate password fields only — actual updateUser is done client-side
// to ensure the recovery token from the URL hash is used, not the cookie session
export async function validatePasswordReset(password: string, confirmPassword: string): Promise<AuthResult> {
  if (!password || !confirmPassword) {
    return { success: false, error: 'Password is required' };
  }
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }
  return { success: true };
}

// Called after client-side updateUser succeeds — activates the profile
export async function activateProfile(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', userId);
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
  const supabase = await createClient();

  // First verify current password by re-authenticating
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { success: false, error: 'User not found' };
  }

  // Try to sign in with current password to verify
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
