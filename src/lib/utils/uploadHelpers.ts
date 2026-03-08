const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validate an image file upload (type + size).
 */
export function validateImageUpload(
  file: File,
  maxSizeMB = 5
): { valid: true } | { valid: false; error: string } {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload an image.' };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File too large. Maximum size is ${maxSizeMB}MB.` };
  }
  return { valid: true };
}

/**
 * Generate a storage upload path with a timestamp prefix.
 */
export function generateUploadPath(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `${prefix}-${timestamp}.${ext}`;
}
