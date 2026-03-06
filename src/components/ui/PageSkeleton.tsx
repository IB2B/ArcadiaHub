'use client';

// Reusable skeleton primitives used by all loading.tsx files

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--border)] rounded-lg ${className}`} />
  );
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[var(--border)] rounded ${className}`} />
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonText className="h-4 w-24" />
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
      </div>
      <SkeletonText className="h-8 w-16" />
      <SkeletonText className="h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonText className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-5 space-y-3">
      <SkeletonText className="h-5 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonText key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

/** Full-page dashboard loading skeleton */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonText className="h-8 w-56" />
        <SkeletonText className="h-4 w-80" />
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
        </div>
        <div className="space-y-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}

/** List-page loading skeleton (cases, events, documents, etc.) */
export function ListPageSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <SkeletonText className="h-8 w-40" />
        <SkeletonBlock className="h-9 w-28 rounded-lg" />
      </div>
      {/* Filter bar */}
      <div className="flex gap-3">
        <SkeletonBlock className="h-9 w-48 rounded-lg" />
        <SkeletonBlock className="h-9 w-32 rounded-lg" />
      </div>
      {/* Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <SkeletonText className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Admin page loading skeleton */
export function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <SkeletonText className="h-8 w-48" />
        <SkeletonBlock className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <SkeletonText className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
