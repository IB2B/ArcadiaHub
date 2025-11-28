'use client';

import { memo, useState, useCallback, useMemo, ReactNode } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type ViewMode = 'grid' | 'table';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataDisplayProps<T> {
  data: T[];
  columns: Column<T>[];
  renderCard: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  defaultView?: ViewMode;
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  actions?: ReactNode;
  gridCols?: 1 | 2 | 3 | 4;
}

const icons = {
  grid: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  table: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
    </svg>
  ),
};

const gridColsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

// Loading Skeleton
const GridSkeleton = memo(function GridSkeleton({ cols }: { cols: number }) {
  return (
    <div className={`grid gap-4 ${gridColsClasses[cols as keyof typeof gridColsClasses]}`}>
      {[1, 2, 3, 4].slice(0, cols).map((i) => (
        <Card key={i}>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-[var(--card-hover)] rounded w-3/4" />
              <div className="h-4 bg-[var(--card-hover)] rounded w-1/2" />
              <div className="h-20 bg-[var(--card-hover)] rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

const TableSkeleton = memo(function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-[var(--card-hover)] rounded mb-2" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 bg-[var(--card-hover)] rounded mb-2 opacity-75" />
      ))}
    </div>
  );
});

function DataDisplay<T>({
  data,
  columns,
  renderCard,
  keyExtractor,
  defaultView = 'grid',
  loading = false,
  emptyMessage = 'No data found',
  title,
  actions,
  gridCols = 3,
}: DataDisplayProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);

  const toggleView = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const getValue = useCallback((item: T, key: string): ReactNode => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return null;
      }
    }
    return value as ReactNode;
  }, []);

  // Memoized grid view
  const gridView = useMemo(
    () => (
      <div className={`grid gap-4 ${gridColsClasses[gridCols]}`}>
        {data.map((item) => (
          <div key={keyExtractor(item)}>{renderCard(item)}</div>
        ))}
      </div>
    ),
    [data, gridCols, keyExtractor, renderCard]
  );

  // Memoized table view
  const tableView = useMemo(
    () => (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-[var(--card-hover)] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={`${keyExtractor(item)}-${col.key as string}`}
                    className="px-4 py-3 text-sm text-[var(--text)]"
                  >
                    {col.render ? col.render(item) : getValue(item, col.key as string)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    [data, columns, keyExtractor, getValue]
  );

  if (loading) {
    return viewMode === 'grid' ? <GridSkeleton cols={gridCols} /> : <TableSkeleton />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {title && <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>}
          {actions}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[var(--card-hover)] rounded-lg">
          <button
            onClick={() => toggleView('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            aria-label="Grid view"
          >
            {icons.grid}
          </button>
          <button
            onClick={() => toggleView('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
            aria-label="Table view"
          >
            {icons.table}
          </button>
        </div>
      </div>

      {/* Content */}
      {data.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-[var(--text-muted)]">{emptyMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        gridView
      ) : (
        <Card padding="none">
          <CardContent>{tableView}</CardContent>
        </Card>
      )}
    </div>
  );
}

export default memo(DataDisplay) as typeof DataDisplay;
