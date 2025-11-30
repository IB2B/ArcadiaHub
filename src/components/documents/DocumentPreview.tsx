'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    title: string;
    file_url: string;
    file_type: string | null;
    file_size: number | null;
    description?: string | null;
  } | null;
}

const icons = {
  close: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  external: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
  document: (
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getPreviewType(fileType: string | null): 'pdf' | 'image' | 'unsupported' {
  if (!fileType) return 'unsupported';
  const type = fileType.toLowerCase();

  if (type === 'pdf' || type === 'application/pdf') {
    return 'pdf';
  }

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(type) ||
      type.startsWith('image/')) {
    return 'image';
  }

  return 'unsupported';
}

export default function DocumentPreview({ isOpen, onClose, document }: DocumentPreviewProps) {
  const t = useTranslations('documents');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document && (window.document.body.style.overflow = 'hidden');
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, document]);

  if (!isOpen || !document) return null;

  const previewType = getPreviewType(document.file_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] m-4 bg-[var(--card)] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text)] truncate">
              {document.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              {document.file_type && (
                <span className="uppercase">{document.file_type}</span>
              )}
              {document.file_size && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(document.file_size)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
              title={t('openInNewTab')}
            >
              {icons.external}
            </a>
            <a
              href={document.file_url}
              download
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
              title={t('download')}
            >
              {icons.download}
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)] transition-colors"
            >
              {icons.close}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[var(--background)]">
          {previewType === 'pdf' && (
            <iframe
              src={`${document.file_url}#toolbar=1&navpanes=0`}
              className="w-full h-full min-h-[70vh]"
              title={document.title}
            />
          )}

          {previewType === 'image' && (
            <div className="flex items-center justify-center p-4 min-h-[50vh]">
              <img
                src={document.file_url}
                alt={document.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {previewType === 'unsupported' && (
            <div className="flex flex-col items-center justify-center p-8 min-h-[50vh] text-center">
              <div className="text-[var(--text-light)] mb-4">
                {icons.document}
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                {t('previewNotAvailable')}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">
                {t('previewNotAvailableHint')}
              </p>
              <a
                href={document.file_url}
                download
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                {icons.download}
                <span>{t('download')}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
