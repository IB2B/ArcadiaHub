'use server';

import { createClient } from '@/lib/database/server';
import { redirect } from '@/navigation';
import { revalidatePath } from 'next/cache';
import {
  LoginSchema,
  SignupSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  parseFormData,
} from '@/lib/validators';

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const parsed = parseFormData(LoginSchema, formData);
  if (!parsed.success) return { success: false, error: parsed.error };
  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard' as never);
  return { success: true };
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const parsed = parseFormData(SignupSchema, formData);
  if (!parsed.success) return { success: false, error: parsed.error };
  const { email, password, companyName, firstName: contactFirstName, lastName: contactLastName } = parsed.data;

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
  redirect('/dashboard' as never);
  return { success: true };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login' as never);
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

  const parsed = parseFormData(ForgotPasswordSchema, formData);
  if (!parsed.success) return { success: false, error: parsed.error };
  const { email } = parsed.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const parsed = parseFormData(ResetPasswordSchema, formData);
  if (!parsed.success) return { success: false, error: parsed.error };
  const { password } = parsed.data;

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
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
