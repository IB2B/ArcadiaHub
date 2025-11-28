'use client';

import { memo } from 'react';
import Badge from '@/components/ui/Badge';
import { Database } from '@/types/database.types';

type CaseHistory = Database['public']['Tables']['case_history']['Row'];

interface CaseTimelineProps {
  history: CaseHistory[];
}

const statusConfig: Record<string, { variant: 'warning' | 'info' | 'default' | 'success' | 'error'; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pending' },
  IN_PROGRESS: { variant: 'info', label: 'In Progress' },
  SUSPENDED: { variant: 'default', label: 'Suspended' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  CANCELLED: { variant: 'error', label: 'Cancelled' },
};

const icons = {
  status: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  create: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
};

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateTime(dateString);
}

function CaseTimeline({ history }: CaseTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        <p className="text-sm">No history available for this case.</p>
      </div>
    );
  }

  // Sort by created_at descending (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-[var(--border)]" />

      {/* Timeline items */}
      <div className="space-y-4 sm:space-y-6">
        {sortedHistory.map((item, index) => {
          const newStatusConfig = statusConfig[item.new_status] || statusConfig.PENDING;
          const oldStatusConfig = item.old_status ? statusConfig[item.old_status] : null;

          return (
            <div key={item.id} className="relative flex gap-3 sm:gap-4">
              {/* Timeline dot */}
              <div className={`
                relative z-10 flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                ${index === 0 ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] border-2 border-[var(--border)] text-[var(--text-muted)]'}
              `}>
                {icons.status}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4 sm:pb-6">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 sm:p-4">
                  {/* Status change */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-[var(--text)]">Status changed</span>
                    {oldStatusConfig && (
                      <>
                        <Badge variant={oldStatusConfig.variant} size="sm">
                          {oldStatusConfig.label}
                        </Badge>
                        <span className="text-[var(--text-muted)]">&rarr;</span>
                      </>
                    )}
                    <Badge variant={newStatusConfig.variant} size="sm">
                      {newStatusConfig.label}
                    </Badge>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                      {item.notes}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[var(--text-muted)]">
                    <span>{getRelativeTime(item.created_at)}</span>
                    <span className="hidden sm:inline">
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(CaseTimeline);
