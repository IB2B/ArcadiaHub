'use client';

import { memo, ReactNode, useMemo } from 'react';

// Table Root
interface TableProps {
  children: ReactNode;
  className?: string;
}

function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-[var(--border)] ${className}`}>
      <table className="w-full text-sm text-left">
        {children}
      </table>
    </div>
  );
}

// Table Header
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`bg-[var(--card-hover)] text-[var(--text)] ${className}`}>
      {children}
    </thead>
  );
}

// Table Body
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={`bg-[var(--card)] divide-y divide-[var(--border)] ${className}`}>
      {children}
    </tbody>
  );
}

// Table Row
interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

function TableRow({ children, className = '', onClick, isClickable = false }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        ${isClickable || onClick ? 'cursor-pointer hover:bg-[var(--card-hover)]' : ''}
        transition-colors ${className}
      `}
    >
      {children}
    </tr>
  );
}

// Table Head Cell
interface TableHeadProps {
  children?: ReactNode;
  className?: string;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
  width?: string;
}

function TableHead({
  children,
  className = '',
  sortable = false,
  sorted = null,
  onSort,
  width,
}: TableHeadProps) {
  return (
    <th
      scope="col"
      style={width ? { width } : undefined}
      onClick={sortable && onSort ? onSort : undefined}
      className={`
        px-4 py-3 font-semibold text-xs uppercase tracking-wider
        ${sortable ? 'cursor-pointer select-none hover:bg-[var(--border)]' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="text-[var(--text-muted)]">
            {sorted === 'asc' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            ) : sorted === 'desc' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            )}
          </span>
        )}
      </div>
    </th>
  );
}

// Table Cell
interface TableCellProps {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}

function TableCell({ children, className = '', colSpan }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 text-[var(--text)] ${className}`}
    >
      {children}
    </td>
  );
}

// Empty State
interface TableEmptyProps {
  message?: string;
  icon?: ReactNode;
  colSpan: number;
}

function TableEmpty({ message = 'No data found', icon, colSpan }: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-12">
        <div className="flex flex-col items-center justify-center text-center">
          {icon || (
            <svg className="w-12 h-12 text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
          <p className="text-[var(--text-muted)]">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Loading Skeleton Row
interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 bg-[var(--card-hover)] rounded animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showItemsInfo?: boolean;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showItemsInfo = true,
}: PaginationProps) {
  const pages = useMemo(() => {
    const items: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);

      if (currentPage > 3) {
        items.push('ellipsis');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(i);
      }

      if (currentPage < totalPages - 2) {
        items.push('ellipsis');
      }

      items.push(totalPages);
    }

    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const startItem = ((currentPage - 1) * (itemsPerPage || 10)) + 1;
  const endItem = Math.min(currentPage * (itemsPerPage || 10), totalItems || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[var(--border)] bg-[var(--card)]">
      {showItemsInfo && totalItems !== undefined && (
        <p className="text-sm text-[var(--text-muted)]">
          Showing <span className="font-medium text-[var(--text)]">{startItem}</span> to{' '}
          <span className="font-medium text-[var(--text)]">{endItem}</span> of{' '}
          <span className="font-medium text-[var(--text)]">{totalItems}</span> results
        </p>
      )}
      <nav className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-[var(--text-muted)]">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors
                ${currentPage === page
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text)] hover:bg-[var(--card-hover)]'
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

// Export all components
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableSkeleton,
  Pagination,
};

export default memo(Table);
