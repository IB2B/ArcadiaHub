'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import CaseCard from '@/components/cases/CaseCard';
import CaseFilters from '@/components/cases/CaseFilters';
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

export default function CasesPageClient({ cases, stats }: CasesPageClientProps) {
  const t = useTranslations('cases');
  const tCommon = useTranslations('common');

  const [filters, setFilters] = useState({ search: '', status: '' });

  const handleFilterChange = useCallback((newFilters: { search: string; status: string }) => {
    setFilters(newFilters);
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesCode = c.case_code.toLowerCase().includes(searchLower);
        const matchesClient = c.client_name.toLowerCase().includes(searchLower);
        if (!matchesCode && !matchesClient) return false;
      }

      // Status filter
      if (filters.status && c.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [cases, filters]);

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
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t('subtitle')}
        </p>
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
      <CaseFilters onFilterChange={handleFilterChange} />

      {/* Cases List */}
      {filteredCases.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {filteredCases.map((caseData) => (
            <CaseCard key={caseData.id} caseData={caseData} />
          ))}
        </div>
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
              {filters.search || filters.status
                ? t('adjustFilters')
                : t('noCasesHint')}
            </p>
          </div>
        </Card>
      )}

      {/* Results count */}
      {filteredCases.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          {tCommon('showing')} {filteredCases.length} {tCommon('of')} {cases.length}
        </p>
      )}
    </div>
  );
}
