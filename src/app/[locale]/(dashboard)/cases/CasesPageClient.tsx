'use client';

import { useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CaseCard from '@/components/cases/CaseCard';
import CaseFilters from '@/components/cases/CaseFilters';
import Pagination from '@/components/ui/Pagination';
import { Database } from '@/types/database.types';

type Case = Database['public']['Tables']['cases']['Row'];

interface CasesPageClientProps {
  cases: Case[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  initialFilters: {
    search: string;
    status: string;
  };
  userRole?: string;
}

const icons = {
  folder: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
  pending: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  progress: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
};

export default function CasesPageClient({
  cases,
  stats,
  pagination,
  initialFilters,
  userRole,
}: CasesPageClientProps) {
  const isAdmin = userRole === 'ADMIN' || userRole === 'COMMERCIAL';
  const t = useTranslations('cases');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const statCards = [
    {
      label: t('totalCases'),
      value: stats.total,
      icon: icons.folder,
      color: 'bg-[var(--primary-light)] text-[var(--primary)]',
    },
    {
      label: t('pending'),
      value: stats.pending,
      icon: icons.pending,
      color: 'bg-[var(--warning-light)] text-[var(--warning)]',
    },
    {
      label: t('inProgress'),
      value: stats.inProgress,
      icon: icons.progress,
      color: 'bg-[var(--info-light)] text-[var(--info)]',
    },
    {
      label: t('completed'),
      value: stats.completed,
      icon: icons.check,
      color: 'bg-[var(--success-light)] text-[var(--success)]',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
            {t('title')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {t('subtitle')}
          </p>
        </div>
        {isAdmin && (
          <Link href="/admin/cases/new">
            <Button size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('newCase')}
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} padding="sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 sm:p-2.5 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text)]">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <CaseFilters initialFilters={initialFilters} />

      {/* Loading State */}
      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {/* Cases List */}
        {cases.length > 0 ? (
          <>
            <div className="space-y-3 sm:space-y-4">
              {cases.map((caseData) => (
                <CaseCard key={caseData.id} caseData={caseData} />
              ))}
            </div>
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                isLoading={isPending}
              />
            )}
          </>
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="text-[var(--text-light)] mb-4">
                {icons.empty}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
                {t('noCases')}
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md">
                {initialFilters.search || initialFilters.status
                  ? t('adjustFilters')
                  : t('noCasesHint')}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
