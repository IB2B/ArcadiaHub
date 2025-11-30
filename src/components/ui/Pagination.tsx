'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemsInfo?: boolean;
  isLoading?: boolean;
  className?: string;
}

const icons = {
  chevronLeft: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  chevronsLeft: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
  ),
  chevronsRight: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  ),
};

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemsInfo = true,
  isLoading = false,
  className = '',
}: PaginationProps) {
  const t = useTranslations('common');

  const pages = useMemo(() => {
    const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      if (currentPage > 3) {
        items.push('ellipsis-start');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (currentPage < totalPages - 2) {
        items.push('ellipsis-end');
      }

      items.push(totalPages);
    }

    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${
        isLoading ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {showItemsInfo && (
        <p className="text-sm text-[var(--text-muted)] order-2 sm:order-1">
          {t('pagination.showing')}{' '}
          <span className="font-medium text-[var(--text)]">{startItem}</span>
          {' '}{t('pagination.to')}{' '}
          <span className="font-medium text-[var(--text)]">{endItem}</span>
          {' '}{t('pagination.of')}{' '}
          <span className="font-medium text-[var(--text)]">{totalItems}</span>
          {' '}{t('pagination.results')}
        </p>
      )}

      <nav className="flex items-center gap-1 order-1 sm:order-2">
        {/* First page button - desktop only */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.firstPage')}
        >
          {icons.chevronsLeft}
        </button>

        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.previousPage')}
        >
          {icons.chevronLeft}
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page) =>
            typeof page === 'string' ? (
              <span
                key={page}
                className="px-2 text-[var(--text-muted)] hidden sm:inline"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors
                  ${
                    currentPage === page
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--text)] hover:bg-[var(--card-hover)]'
                  }
                  ${page !== currentPage && Math.abs(page - currentPage) > 1 ? 'hidden sm:flex items-center justify-center' : ''}
                `}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.nextPage')}
        >
          {icons.chevronRight}
        </button>

        {/* Last page button - desktop only */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label={t('pagination.lastPage')}
        >
          {icons.chevronsRight}
        </button>
      </nav>
    </div>
  );
}
