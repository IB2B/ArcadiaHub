'use client';

import { useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import { TimelineFeed, type FeedItem } from '@/components/dashboard';
import Pagination from '@/components/ui/Pagination';

type SerializedActivityItem = Omit<FeedItem, 'timestamp'> & {
  timestamp: string;
};

interface ActivityPageClientProps {
  activities: SerializedActivityItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  initialFilters: {
    type: string;
  };
}

const activityTypes = [
  { value: '', key: 'all' },
  { value: 'case', key: 'cases' },
  { value: 'event', key: 'events' },
  { value: 'content', key: 'academy' },
  { value: 'document', key: 'documents' },
  { value: 'blog', key: 'blog' },
];

const icons = {
  activity: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
};

export default function ActivityPageClient({
  activities,
  pagination,
  initialFilters,
}: ActivityPageClientProps) {
  const t = useTranslations('activity');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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
      if (!updates.page) {
        params.delete('page');
      }
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleTypeChange = useCallback(
    (type: string) => {
      updateURL({ type });
    },
    [updateURL]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateURL({ page: page.toString() });
    },
    [updateURL]
  );

  // Convert serialized timestamps back to Date objects for TimelineFeed
  const feedItems: FeedItem[] = activities.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
            {icons.activity}
          </div>
          <div>
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
              {t('title')}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {t('subtitle', { count: pagination.totalItems })}
            </p>
          </div>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {activityTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => handleTypeChange(type.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              initialFilters.type === type.value
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
            }`}
          >
            {type.key === 'all' ? t('allActivity') : tNav(type.key)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {/* Activity Feed */}
        {feedItems.length > 0 ? (
          <>
            <TimelineFeed items={feedItems} />
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
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <div className="text-[var(--text-light)] mb-4">
                  {icons.empty}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
                  {t('noActivity')}
                </h3>
                <p className="text-sm text-[var(--text-muted)] max-w-md">
                  {initialFilters.type
                    ? t('noActivityFiltered')
                    : t('noActivityYet')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
