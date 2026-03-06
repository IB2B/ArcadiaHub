/**
 * Zod validation schemas for all server action inputs.
 * Import the relevant schema in each server action file and call .safeParse()
 * at the top of the function before any database work.
 */

import { z } from 'zod';

// ============================================================================
// AUTH
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// ============================================================================
// CASES
// ============================================================================

export const CreateCaseSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255),
  notes: z.string().max(5000).optional(),
});

export const UpdateCaseStatusSchema = z.object({
  caseId: z.string().uuid('Invalid case ID'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SUSPENDED', 'COMPLETED', 'CANCELLED']),
});

// ============================================================================
// PROFILES
// ============================================================================

export const UpdateProfileSchema = z.object({
  company_name: z.string().max(255).optional().nullable(),
  contact_first_name: z.string().max(100).optional().nullable(),
  contact_last_name: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  description: z.string().max(2000).optional().nullable(),
});

// ============================================================================
// EVENTS
// ============================================================================

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  event_type: z.string().min(1, 'Event type is required'),
  start_datetime: z.string().datetime('Invalid start datetime'),
  end_datetime: z.string().datetime('Invalid end datetime').optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  meeting_link: z.string().url().optional().nullable().or(z.literal('')),
  is_published: z.boolean().optional(),
});

// ============================================================================
// ACADEMY
// ============================================================================

export const CreateAcademyContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  content_type: z.string().min(1, 'Content type is required'),
  media_url: z.string().url().optional().nullable().or(z.literal('')),
  year: z.number().int().min(2000).max(2100).optional().nullable(),
  theme: z.string().max(255).optional().nullable(),
  duration_minutes: z.number().int().min(1).max(9999).optional().nullable(),
  is_downloadable: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

// ============================================================================
// DOCUMENTS
// ============================================================================

export const CreateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  file_url: z.string().url('Invalid file URL'),
  file_type: z.string().max(100).optional().nullable(),
  file_size: z.number().int().positive().optional().nullable(),
  folder_path: z.string().max(500).optional().nullable(),
  is_published: z.boolean().optional(),
});

// ============================================================================
// BLOG
// ============================================================================

export const CreateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens'),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().url().optional().nullable().or(z.literal('')),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional().nullable(),
  is_published: z.boolean().optional(),
});

// ============================================================================
// ACCESS REQUESTS
// ============================================================================

export const CreateAccessRequestSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(255),
  contact_first_name: z.string().min(1, 'First name is required').max(100),
  contact_last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(50).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

// ============================================================================
// HELPERS
// ============================================================================

/** Parse a FormData object against a Zod schema and return typed data or error string. */
export function parseFormData<T extends z.ZodTypeAny>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const raw = Object.fromEntries(formData.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { success: false, error: firstError?.message ?? 'Invalid input' };
  }
  return { success: true, data: result.data };
}
