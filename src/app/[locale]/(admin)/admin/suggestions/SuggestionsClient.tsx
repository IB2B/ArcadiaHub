'use client';

import { useState, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import SuggestionDetailModal from './SuggestionDetailModal';
import { type Suggestion } from '@/lib/data/suggestions';

const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  pending: 'warning',
  reviewed: 'info',
  resolved: 'success',
  all: 'default',
};

interface SuggestionsClientProps {
  initialSuggestions: Suggestion[];
  total: number;
  totalPages: number;
  initialStatus: string;
  initialSearch: string;
  initialPage: number;
}

export default function SuggestionsClient({
  initialSuggestions,
  total,
  totalPages,
  initialStatus,
  initialSearch,
  initialPage,
}: SuggestionsClientProps) {
  const t = useTranslations('suggestions.admin');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const tabs = ['all', 'pending', 'reviewed', 'resolved'] as const;

  const handleTabChange = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'all') {
      params.delete('status');
    } else {
      params.set('status', tab);
    }
    params.delete('page');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams]);

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams]);

  const handleRowClick = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setModalOpen(true);
  };

  const handleUpdated = () => {
    router.refresh();
  };

  return (
    <>
      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              initialStatus === tab || (tab === 'all' && initialStatus === 'all')
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {t(tab as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('partner')}</TableHead>
              <TableHead>{t('subject')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead width="80px"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialSuggestions.length === 0 ? (
              <TableEmpty colSpan={5} message={t('noSuggestions')} />
            ) : (
              initialSuggestions.map((s) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-[var(--card-hover)]" onClick={() => handleRowClick(s)}>
                  <TableCell>
                    <span className="text-sm font-medium text-[var(--text)]">
                      {s.profile?.company_name || `${s.profile?.contact_first_name ?? ''} ${s.profile?.contact_last_name ?? ''}`.trim() || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--text)] line-clamp-1">{s.subject}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--text-muted)]">
                      {format(new Date(s.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[s.status] ?? 'default'} size="sm">
                      {t(s.status as Parameters<typeof t>[0])}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={initialPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={20}
          onPageChange={handlePageChange}
        />
      )}

      <SuggestionDetailModal
        suggestion={selectedSuggestion}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdated={handleUpdated}
      />
    </>
  );
}
