'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { type AccessRequest } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

interface AccessRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AccessRequest | null;
  notes: string;
  onNotesChange: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export default function AccessRequestDetailModal({
  isOpen,
  onClose,
  request,
  notes,
  onNotesChange,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: AccessRequestDetailModalProps) {
  const t = useTranslations('admin.accessRequests');

  if (!isOpen || !request) return null;

  const getStatusBadge = () => {
    switch (request.status) {
      case 'PENDING':
        return <Badge variant="warning" size="sm">{t('status.pending')}</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm">{t('status.approved')}</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">{t('status.rejected')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-[var(--card)] rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-[var(--text)]">{t('detail.title')}</h2>
              {getStatusBadge()}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {t('detail.personalInfo')}
                </h3>

                <div className="flex items-center gap-3">
                  <Avatar
                    size="lg"
                    name={`${request.contact_first_name} ${request.contact_last_name}`}
                    src={request.contact_photo_url || undefined}
                  />
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      {request.contact_first_name} {request.contact_last_name}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{request.contact_description}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <a href={`mailto:${request.contact_email}`} className="text-[var(--primary)] hover:underline">
                      {request.contact_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <span className="text-[var(--text)]">{request.contact_phone}</span>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                  {t('detail.companyInfo')}
                </h3>

                <div className="flex items-center gap-3">
                  {request.company_logo_url ? (
                    <div className="w-12 h-12 rounded-lg bg-white p-1 border border-[var(--border)]">
                      <img
                        src={request.company_logo_url}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[var(--text)]">{request.company_name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{request.company_description}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <div>
                      <p className="text-[var(--text-muted)]">{t('detail.legalAddress')}</p>
                      <p className="text-[var(--text)]">{request.legal_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                    <div>
                      <p className="text-[var(--text-muted)]">{t('detail.operationalAddress')}</p>
                      <p className="text-[var(--text)]">{request.operational_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <span className="text-[var(--text)]">{request.business_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <a href={`mailto:${request.generic_email}`} className="text-[var(--primary)] hover:underline">
                      {request.generic_email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span className="text-[var(--text)]">PEC: {request.pec}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Request metadata */}
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                <span>{t('detail.submitted')}: {format(new Date(request.created_at), 'PPP')}</span>
                {request.reviewed_at && (
                  <span>{t('detail.reviewed')}: {format(new Date(request.reviewed_at), 'PPP')}</span>
                )}
                {request.reviewer && (
                  <span>{t('detail.reviewedBy')}: {request.reviewer.contact_first_name} {request.reviewer.contact_last_name}</span>
                )}
              </div>
              {request.review_notes && (
                <div className="mt-2 p-3 rounded-lg bg-[var(--card-hover)]">
                  <p className="text-sm text-[var(--text-muted)]">{t('detail.notes')}:</p>
                  <p className="text-sm text-[var(--text)]">{request.review_notes}</p>
                </div>
              )}
            </div>

            {/* Action notes for pending requests */}
            {request.status === 'PENDING' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  {t('detail.addNotes')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                  placeholder={t('detail.notesPlaceholder')}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--border)]">
            <Button variant="outline" onClick={onClose}>
              {t('detail.close')}
            </Button>
            {request.status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  onClick={onReject}
                  isLoading={isRejecting}
                  className="text-[var(--error)] border-[var(--error)] hover:bg-[var(--error)]/10"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  {t('actions.reject')}
                </Button>
                <Button onClick={onApprove} isLoading={isApproving}>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('actions.approve')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
