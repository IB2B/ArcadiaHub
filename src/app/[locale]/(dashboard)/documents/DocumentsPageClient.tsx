'use client';

import { useState, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Database } from '@/types/database.types';

type Document = Database['public']['Tables']['documents']['Row'];

interface DocumentsPageClientProps {
  documents: Document[];
  stats: {
    total: number;
    byCategory: Record<string, number>;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  initialFilters: {
    search: string;
    category: string;
  };
}

const categoryConfig: Record<string, { key: string; color: string; icon: React.ReactNode }> = {
  CONTRACTS: {
    key: 'contracts',
    color: 'bg-[var(--primary-light)] text-[var(--primary)]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  PRESENTATIONS: {
    key: 'presentations',
    color: 'bg-purple-100 text-purple-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
      </svg>
    ),
  },
  BRAND_KIT: {
    key: 'brand_kit',
    color: 'bg-pink-100 text-pink-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
      </svg>
    ),
  },
  MARKETING: {
    key: 'marketing',
    color: 'bg-green-100 text-green-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
      </svg>
    ),
  },
  GUIDELINES: {
    key: 'guidelines',
    color: 'bg-orange-100 text-orange-600',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
};

const icons = {
  search: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  download: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  ),
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getFileTypeIcon(fileType: string | null) {
  return icons.document;
}

export default function DocumentsPageClient({
  documents,
  stats,
  pagination,
  initialFilters,
}: DocumentsPageClientProps) {
  const t = useTranslations('documents');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(initialFilters.search);
  const selectedCategory = initialFilters.category || null;

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

  const handleSearch = useCallback(() => {
    updateURL({ search });
  }, [search, updateURL]);

  const handleCategoryChange = useCallback(
    (category: string | null) => {
      updateURL({ category: category || '' });
    },
    [updateURL]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateURL({ page: page.toString() });
    },
    [updateURL]
  );

  // Group by category for display
  const documentsByCategory: Record<string, Document[]> = {};
  documents.forEach((doc) => {
    if (!documentsByCategory[doc.category]) {
      documentsByCategory[doc.category] = [];
    }
    documentsByCategory[doc.category].push(doc);
  });

  const categories = Object.keys(stats.byCategory);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
            {icons.folder}
          </div>
          <div>
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
              {t('title')}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {t('documentsAvailable', { count: stats.total })}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
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
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
          }`}
        >
          {t('all')} ({stats.total})
        </button>
        {categories.map((cat) => {
          const config = categoryConfig[cat] || { key: cat.toLowerCase(), color: 'bg-gray-100 text-gray-600' };
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {t(`categories.${config.key}`)} ({stats.byCategory[cat]})
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {/* Documents List */}
        {documents.length > 0 ? (
          <>
            <div className="space-y-6">
              {Object.entries(documentsByCategory).map(([category, docs]) => {
                const config = categoryConfig[category] || { key: category.toLowerCase(), color: 'bg-gray-100 text-gray-600', icon: icons.document };
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded ${config.color}`}>
                        {config.icon}
                      </div>
                      <h2 className="font-semibold text-[var(--text)]">{t(`categories.${config.key}`)}</h2>
                      <Badge variant="default" size="sm">{docs.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {docs.map((doc) => (
                        <Link key={doc.id} href={`/documents/${doc.id}`} className="block">
                          <Card hover className="group h-full">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
                                {getFileTypeIcon(doc.file_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--primary)] line-clamp-2 mb-1 transition-colors">
                                  {doc.title}
                                </h3>
                                {doc.description && (
                                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
                                    {doc.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                  {doc.file_type && (
                                    <span className="uppercase">{doc.file_type}</span>
                                  )}
                                  {doc.file_size && (
                                    <span>{formatFileSize(doc.file_size)}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0 flex items-center gap-1">
                                <a
                                  href={doc.file_url}
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg text-[var(--text-light)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                                  title={t('download')}
                                >
                                  {icons.download}
                                </a>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
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
                {t('noDocuments')}
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md">
                {initialFilters.search || initialFilters.category
                  ? t('adjustFilters')
                  : t('noDocumentsYet')}
              </p>
            </div>
          </Card>
        )}
      </div>

    </div>
  );
}
