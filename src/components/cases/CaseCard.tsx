'use client';

import { memo } from 'react';
import { Link } from '@/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Database } from '@/types/database.types';

type Case = Database['public']['Tables']['cases']['Row'];

interface CaseCardProps {
  caseData: Case;
}

const statusConfig: Record<string, { variant: 'warning' | 'info' | 'default' | 'success' | 'error'; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  IN_PROGRESS: { variant: 'info', label: 'In Progress' },
  SUSPENDED: { variant: 'default', label: 'Suspended' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'error', label: 'Cancelled' },
};

const icons = {
  folder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  arrow: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  ),
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function CaseCard({ caseData }: CaseCardProps) {
  const status = caseData.status || 'PENDING';
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Link href={`/cases/${caseData.id}`}>
      <Card hover className="group">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">
            {icons.folder}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] truncate">
                  {caseData.case_code}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-[var(--text-muted)]">
                  {icons.user}
                  <span className="text-xs sm:text-sm truncate">{caseData.client_name}</span>
                </div>
              </div>
              <Badge variant={config.variant} size="sm" dot>
                {config.label}
              </Badge>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-1">
                {icons.calendar}
                <span>Opened {formatDate(caseData.opened_at)}</span>
              </div>
              {caseData.closed_at && (
                <div className="flex items-center gap-1">
                  <span>Closed {formatDate(caseData.closed_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors">
            {icons.arrow}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default memo(CaseCard);
