'use server';

import { createClient } from '@/lib/database/server';

export type StorageBucket =
  | 'documents'
  | 'academy-media'
  | 'blog-images'
  | 'event-attachments'
  | 'partner-logos'
  | 'case-documents'
  | 'access-requests';

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  folder?: string
): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = folder
      ? `${folder}/${timestamp}-${sanitizedName}`
      : `${timestamp}-${sanitizedName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Upload file from FormData (for use with server actions)
 */
export async function uploadFileFromFormData(
  formData: FormData,
  bucket: StorageBucket,
  fieldName: string = 'file',
  folder?: string
): Promise<UploadResult> {
  const file = formData.get(fieldName) as File | null;

  if (!file || file.size === 0) {
    return { success: false, error: 'No file provided' };
  }

  return uploadFile(bucket, file, folder);
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<DeleteResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}
