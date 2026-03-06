/**
 * Unified authentication & authorization guards for server actions and server components.
 *
 * Usage in a server action:
 *   const { user, profile } = await requireAuth();
 *   const { user, profile } = await requireRole(['ADMIN', 'COMMERCIAL']);
 *
 * Both functions throw a structured AuthError on failure so callers can catch and
 * convert to user-facing messages without leaking server details.
 */

import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'PROFILE_NOT_FOUND'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthContext {
  userId: string;
  profile: Profile;
}

/**
 * Verifies the caller is authenticated and has an active profile.
 * Throws AuthError if not.
 */
export async function requireAuth(): Promise<AuthContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError('Authentication required', 'UNAUTHENTICATED');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'id, email, role, company_name, logo_url, contact_first_name, contact_last_name, phone, address, city, region, country, postal_code, category, website, description, social_links, tags, is_active, notification_preferences, assigned_commercial_id, created_at, updated_at'
    )
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    throw new AuthError('User profile not found', 'PROFILE_NOT_FOUND');
  }

  return { userId: user.id, profile };
}

/**
 * Verifies the caller is authenticated AND holds one of the allowed roles.
 * Throws AuthError if not.
 *
 * @param roles - Array of allowed role strings, e.g. ['ADMIN', 'COMMERCIAL']
 */
export async function requireRole(roles: string[]): Promise<AuthContext> {
  const ctx = await requireAuth();

  if (!roles.includes(ctx.profile.role)) {
    throw new AuthError(
      `Access denied. Required roles: ${roles.join(', ')}`,
      'UNAUTHORIZED'
    );
  }

  return ctx;
}

/**
 * Returns true/false without throwing — useful for conditional rendering in Server Components.
 */
export async function hasRole(roles: string[]): Promise<boolean> {
  try {
    await requireRole(roles);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts an AuthError into a safe user-facing result object.
 * Use in server actions that need to return { success, error } instead of throwing.
 */
export function authErrorToResult(err: unknown): { success: false; error: string } {
  if (err instanceof AuthError) {
    switch (err.code) {
      case 'UNAUTHENTICATED':
        return { success: false, error: 'You must be logged in to perform this action.' };
      case 'UNAUTHORIZED':
        return { success: false, error: 'You do not have permission to perform this action.' };
      case 'PROFILE_NOT_FOUND':
        return { success: false, error: 'User profile not found. Please contact support.' };
    }
  }
  return { success: false, error: 'An unexpected error occurred. Please try again.' };
}
