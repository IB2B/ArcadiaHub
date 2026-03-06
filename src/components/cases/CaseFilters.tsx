'use client';

import { memo, useState, useCallback, useTransition } from 'react';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

interface CaseFiltersProps {
  initialFilters?: {
    search?: string;
    status?: string;
  };
}

const statusOptionsConfig = [
  { value: '', key: 'allStatus' },
  { value: 'PENDING', key: 'pending' },
  { value: 'IN_PROGRESS', key: 'in_progress' },
  { value: 'SUSPENDED', key: 'suspended' },
  { value: 'COMPLETED', key: 'completed' },
  { value: 'CANCELLED', key: 'cancelled' },
];

const icons = {
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  filter: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
  ),
  clear: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
};

function CaseFilters({ initialFilters }: CaseFiltersProps) {
  const t = useTranslations('cases');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const updateURL = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.delete('page');
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateURL({ search });
  }, [search, updateURL]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateURL({ status: e.target.value });
  }, [updateURL]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    updateURL({ search: '', status: '' });
  }, [updateURL]);

  const hasActiveFilters = initialFilters?.search || initialFilters?.status;

  return (
    <div className="space-y-3">
      {/* Search and Toggle */}
      <div className={`flex gap-2 sm:gap-3 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex-1"
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icons.search}
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={handleSearch}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </form>

        {/* Filter Toggle (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`md:hidden p-2 sm:p-2.5 rounded-lg border transition-colors ${
            hasActiveFilters
              ? 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary)]'
              : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]'
          }`}
        >
          {icons.filter}
        </button>

        {/* Status Select (Desktop) */}
        <div className="hidden md:block">
          <select
            value={initialFilters?.status || ''}
            onChange={handleStatusChange}
            className="h-full px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
          >
            {statusOptionsConfig.map((option) => (
              <option key={option.value} value={option.value}>
                {option.key === 'allStatus' ? t('allStatus') : t(`statuses.${option.key}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Button (Desktop) */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="hidden md:flex"
          >
            {icons.clear}
            <span className="ml-1">{t('clear')}</span>
          </Button>
        )}
      </div>

      {/* Mobile Filters Dropdown */}
      {showFilters && (
        <div className="md:hidden p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg space-y-3 animate-slideUp">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
              {t('status')}
            </label>
            <select
              value={initialFilters?.status || ''}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
            >
              {statusOptionsConfig.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.key === 'allStatus' ? t('allStatus') : t(`statuses.${option.key}`)}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              fullWidth
            >
              {icons.clear}
              <span className="ml-1">{t('clearFilters')}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(CaseFilters);
