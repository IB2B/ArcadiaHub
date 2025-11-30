'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { format } from 'date-fns';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Database } from '@/types/database.types';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentDetailClientProps {
  document: Document;
  relatedDocs: Document[];
}

const categoryConfig: Record<string, { key: string; color: string }> = {
  CONTRACTS: { key: 'contracts', color: 'bg-blue-100 text-blue-600' },
  PRESENTATIONS: { key: 'presentations', color: 'bg-purple-100 text-purple-600' },
  BRAND_KIT: { key: 'brand_kit', color: 'bg-pink-100 text-pink-600' },
  MARKETING: { key: 'marketing', color: 'bg-green-100 text-green-600' },
  GUIDELINES: { key: 'guidelines', color: 'bg-orange-100 text-orange-600' },
};

const icons = {
  download: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  file: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  size: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  folder: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getFileIcon(fileType: string | null) {
  const type = fileType?.toLowerCase() || '';

  if (type === 'pdf') {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M9 13h1.5c.5 0 1 .2 1.3.5.3.4.5.8.5 1.3 0 .4-.2.9-.5 1.2-.3.3-.8.5-1.3.5H9v-3.5zm0 3.5V20m4-7h2.5M15 13v7m2-4h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (['doc', 'docx'].includes(type)) {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (['xls', 'xlsx'].includes(type)) {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M8 13h2v2H8v-2zm4 0h2v2h-2v-2zm-4 4h2v2H8v-2zm4 0h2v2h-2v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (['ppt', 'pptx'].includes(type)) {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M9 13h1.5c.5 0 1 .2 1.3.5.3.4.5.8.5 1.3 0 .4-.2.9-.5 1.2-.3.3-.8.5-1.3.5H9v-3.5zm0 3.5V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(type)) {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M20 17l-2.5-2.5a2 2 0 0 0-2.83 0L8 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  if (type === 'zip' || type === 'rar') {
    return (
      <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6M10 12h1v1h-1v-1zm2 0h1v1h-1v-1zm-2 2h1v1h-1v-1zm2 0h1v1h-1v-1zm-2 2h1v1h-1v-1zm2 0h1v1h-1v-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  // Default file icon
  return (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function DocumentDetailClient({ document, relatedDocs }: DocumentDetailClientProps) {
  const t = useTranslations('documents');
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const categoryConf = categoryConfig[document.category] || { key: document.category.toLowerCase(), color: 'bg-gray-100 text-gray-600' };
  const isPdf = document.file_type?.toLowerCase() === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(document.file_type?.toLowerCase() || '');

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Preview & Info - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Area */}
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              {/* File Icon */}
              <div className="text-[var(--primary)] mb-6">
                {getFileIcon(document.file_type)}
              </div>

              {/* File Info */}
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-2">
                  {document.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <Badge variant="primary">{t(`categories.${categoryConf.key}`)}</Badge>
                  {document.file_type && (
                    <Badge variant="default">{document.file_type.toUpperCase()}</Badge>
                  )}
                </div>
                {document.description && (
                  <p className="text-[var(--text-muted)] max-w-md mx-auto">
                    {document.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href={document.file_url} download className="inline-block">
                  <Button size="lg">
                    {icons.download}
                    <span>{t('downloadFile')}</span>
                  </Button>
                </a>
                {isPdf && (
                  <Button variant="outline" size="lg" onClick={() => setIsPdfPreviewOpen(true)}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('preview')}</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Image Preview */}
          {isImage && document.file_url && (
            <Card padding="md">
              <h3 className="font-semibold text-[var(--text)] mb-4">{t('preview')}</h3>
              <div className="rounded-lg overflow-hidden bg-[var(--card-hover)]">
                <img
                  src={document.file_url}
                  alt={document.title}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              </div>
            </Card>
          )}

          {/* PDF Inline Preview */}
          {isPdf && isPdfPreviewOpen && (
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--text)]">{t('documentPreview')}</h3>
                <button
                  onClick={() => setIsPdfPreviewOpen(false)}
                  className="p-1 rounded hover:bg-[var(--card-hover)] text-[var(--text-muted)]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="rounded-lg overflow-hidden border border-[var(--border)]" style={{ height: '600px' }}>
                <iframe
                  src={`${document.file_url}#view=FitH`}
                  title={document.title}
                  className="w-full h-full"
                />
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* File Details Card */}
          <Card padding="md">
            <h3 className="font-semibold text-[var(--text)] mb-4">{t('fileDetails')}</h3>
            <div className="space-y-3">
              {document.file_type && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">{icons.file}</span>
                  <div>
                    <p className="text-[var(--text-light)] text-xs">{t('fileType')}</p>
                    <p className="text-[var(--text)] font-medium">{document.file_type.toUpperCase()}</p>
                  </div>
                </div>
              )}
              {document.file_size && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">{icons.size}</span>
                  <div>
                    <p className="text-[var(--text-light)] text-xs">{t('fileSize')}</p>
                    <p className="text-[var(--text)] font-medium">{formatFileSize(document.file_size)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[var(--text-muted)]">{icons.folder}</span>
                <div>
                  <p className="text-[var(--text-light)] text-xs">{t('category')}</p>
                  <p className="text-[var(--text)] font-medium">{t(`categories.${categoryConf.key}`)}</p>
                </div>
              </div>
              {document.created_at && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">{icons.calendar}</span>
                  <div>
                    <p className="text-[var(--text-light)] text-xs">{t('uploadedOn')}</p>
                    <p className="text-[var(--text)] font-medium">{format(new Date(document.created_at), 'PPP')}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Related Documents */}
          {relatedDocs.length > 0 && (
            <Card padding="md">
              <h3 className="font-semibold text-[var(--text)] mb-4">{t('relatedDocuments')}</h3>
              <div className="space-y-3">
                {relatedDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors group"
                  >
                    <div className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                      {icons.file}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                        {doc.file_type && <span className="uppercase">{doc.file_type}</span>}
                        {doc.file_size && <span>{formatFileSize(doc.file_size)}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
