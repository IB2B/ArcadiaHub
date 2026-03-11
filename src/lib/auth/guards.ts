// No 'use server' directive — this is a utility module, not a server actions file.
// Import directly: import { requireRole } from '@/lib/auth/guards'

import { getCurrentProfile } from '@/lib/database/server';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export class AuthError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Asserts that the current user has one of the given roles.
 * Throws AuthError if not authenticated or role doesn't match.
 * Returns the profile on success.
 */
export async function requireRole(roles: string[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new AuthError('Not authenticated');
  if (!roles.includes(profile.role)) throw new AuthError('Insufficient permissions');
  return profile;
}
