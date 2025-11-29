'use client';

import { useTranslations } from 'next-intl';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CaseTimeline from '@/components/cases/CaseTimeline';
import { Database } from '@/types/database.types';

type Case = Database['public']['Tables']['cases']['Row'];
type CaseDocument = Database['public']['Tables']['case_documents']['Row'];
type CaseHistory = Database['public']['Tables']['case_history']['Row'];

type CaseWithDetails = Case & {
  documents?: CaseDocument[];
  history?: CaseHistory[];
};

interface CaseDetailClientProps {
  caseData: CaseWithDetails;
}

const statusConfig: Record<string, { variant: 'warning' | 'info' | 'default' | 'success' | 'error'; key: string }> = {
  PENDING: { variant: 'warning', key: 'pending' },
  IN_PROGRESS: { variant: 'info', key: 'in_progress' },
  SUSPENDED: { variant: 'default', key: 'suspended' },
  COMPLETED: { variant: 'success', key: 'completed' },
  CANCELLED: { variant: 'error', key: 'cancelled' },
};

const icons = {
  folder: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  empty: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function getFileIcon(fileType: string | null) {
  // Could be extended to show different icons based on file type
  return icons.document;
}

export default function CaseDetailClient({ caseData }: CaseDetailClientProps) {
  const t = useTranslations('cases');
  const status = caseData.status || 'PENDING';
  const config = statusConfig[status] || statusConfig.PENDING;
  const documents = caseData.documents || [];
  const history = caseData.history || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Case Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
            {icons.folder}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                {caseData.case_code}
              </h1>
              <Badge variant={config.variant} size="md" dot>
                {t(`statuses.${config.key}`)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
              {/* Client */}
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                {icons.user}
                <span className="truncate">{caseData.client_name}</span>
              </div>

              {/* Opened Date */}
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                {icons.calendar}
                <span>{t('opened')}: {formatDate(caseData.opened_at)}</span>
              </div>

              {/* Closed Date */}
              {caseData.closed_at && (
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  {icons.calendar}
                  <span>{t('closed')}: {formatDate(caseData.closed_at)}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {caseData.notes && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <h3 className="text-sm font-medium text-[var(--text)] mb-1">{t('notes')}</h3>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                  {caseData.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Documents Column */}
        <div className="lg:col-span-1">
          <Card padding="none">
            <CardHeader
              title={t('documents')}
              subtitle={t('fileCount', { count: documents.length })}
              className="p-4 border-b border-[var(--border)]"
            />
            <CardContent className="p-4">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors group"
                    >
                      <div className="flex-shrink-0 text-[var(--text-muted)]">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] truncate">
                          {doc.title}
                        </p>
                        {doc.file_type && (
                          <p className="text-xs text-[var(--text-muted)] uppercase">
                            {doc.file_type}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors">
                        {icons.download}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="text-[var(--text-light)] mb-2">
                    {icons.empty}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {t('noDocuments')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline Column */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <CardHeader
              title={t('activityTimeline')}
              subtitle={t('caseHistoryUpdates')}
              className="p-4 border-b border-[var(--border)]"
            />
            <CardContent className="p-4">
              <CaseTimeline history={history} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
