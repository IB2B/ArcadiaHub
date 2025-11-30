'use client';

import { useState, useRef, useCallback, useId } from 'react';
import { useTranslations } from 'next-intl';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  value?: string | null;
  onChange?: (url: string | null, file?: File) => void;
  onFileSelect?: (file: File) => void;
  uploadAction?: (formData: FormData) => Promise<{ success: boolean; url?: string; error?: string }>;
  disabled?: boolean;
  label?: string;
  hint?: string;
  error?: string;
  showPreview?: boolean;
  previewType?: 'image' | 'file';
  className?: string;
}

const icons = {
  upload: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  ),
  file: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  close: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
};

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export default function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  value,
  onChange,
  onFileSelect,
  uploadAction,
  disabled = false,
  label,
  hint,
  error,
  showPreview = true,
  previewType = 'file',
  className = '',
}: FileUploadProps) {
  const t = useTranslations('common');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    // Validate size
    if (file.size > maxSize) {
      setUploadError(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
      return;
    }

    setUploadError(null);
    setSelectedFile(file);

    if (onFileSelect) {
      onFileSelect(file);
    }

    // If there's an upload action, use it
    if (uploadAction) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadAction(formData);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success && result.url) {
          onChange?.(result.url, file);
        } else {
          setUploadError(result.error || 'Upload failed');
        }
      } catch (err) {
        clearInterval(progressInterval);
        setUploadError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } else {
      // Just report the file, let parent handle upload
      onChange?.(null, file);
    }
  }, [maxSize, uploadAction, onChange, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [disabled, processFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setUploadError(null);
    onChange?.(null);
  }, [onChange]);

  const displayError = error || uploadError;
  const hasValue = value || selectedFile;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text)] mb-1.5">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
      />

      {/* Current value preview */}
      {hasValue && showPreview && (
        <div className="mb-3 p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <div className="flex items-center gap-3">
            {previewType === 'image' && value ? (
              <img
                src={value}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-[var(--border)]"
              />
            ) : (
              <div className="w-10 h-10 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg flex items-center justify-center">
                {icons.file}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">
                {selectedFile?.name || (value ? 'Uploaded file' : '')}
              </p>
              {selectedFile && (
                <p className="text-xs text-[var(--text-muted)]">
                  {formatFileSize(selectedFile.size)}
                </p>
              )}
              {value && !selectedFile && (
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {value}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-light)] rounded-lg transition-colors"
            >
              {icons.close}
            </button>
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="mt-3">
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Drop zone */}
      {!hasValue && (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
            ${isDragging
              ? 'border-[var(--primary)] bg-[var(--primary-light)]'
              : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--card-hover)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${displayError ? 'border-[var(--error)]' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={`text-[var(--text-muted)] ${isDragging ? 'text-[var(--primary)]' : ''}`}>
              {icons.upload}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">
                Drop file here or <span className="text-[var(--primary)]">browse</span>
              </p>
              {hint && (
                <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>
              )}
              {accept && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Accepted: {accept}
                </p>
              )}
              <p className="text-xs text-[var(--text-muted)]">
                Max size: {formatFileSize(maxSize)}
              </p>
            </div>
          </div>

          {/* Upload progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
                <p className="text-sm text-[var(--text)]">Uploading... {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <p className="mt-1.5 text-sm text-[var(--error)]">{displayError}</p>
      )}
    </div>
  );
}
