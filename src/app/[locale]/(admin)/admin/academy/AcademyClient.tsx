'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/navigation';
import { Tables } from '@/types/database.types';
import { updateAcademyContent, deleteAcademyContent, type PaginatedResult } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
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

type AcademyContent = Tables<'academy_content'>;

interface AcademyClientProps {
  initialData: PaginatedResult<AcademyContent>;
  initialFilters: {
    search: string;
    contentType: string;
    year: string;
    published: string;
  };
}

const CONTENT_TYPES = ['video', 'gallery', 'slides', 'podcast', 'recording'] as const;

export default function AcademyClient({ initialData, initialFilters }: AcademyClientProps) {
  const t = useTranslations('admin');
  const tAcademy = useTranslations('admin.academy');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [search, setSearch] = useState(initialFilters.search);
  const [contentType, setContentType] = useState(initialFilters.contentType);
  const [year, setYear] = useState(initialFilters.year);
  const [published, setPublished] = useState(initialFilters.published);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<AcademyContent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate year  options (from current year to 5 years ago)
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: '', label: 'All Years' },
    ...Array.from({ length: 6 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    })),
  ];

  // Update URL with filters
  const updateFilters = useCallback((updates: Record<string, string>) => {
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
  }, [router, searchParams]);

  // Handle search
  const handleSearch = useCallback(() => {
    updateFilters({ search });
  }, [search, updateFilters]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams]);

  // Handle publish toggle
  const handleTogglePublish = useCallback(async (content: AcademyContent) => {
    startTransition(async () => {
      await updateAcademyContent(content.id, { is_published: !content.is_published });
      router.refresh();
    });
  }, [router]);

  // Handle delete
  const handleDeleteClick = useCallback((content: AcademyContent) => {
    setContentToDelete(content);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!contentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAcademyContent(contentToDelete.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setContentToDelete(null);
    }
  }, [contentToDelete, router]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setContentType('');
    setYear('');
    setPublished('');
    startTransition(() => {
      router.push('/admin/academy');
    });
  }, [router]);

  // Filter configurations
  const filters = useMemo(() => [
    {
      key: 'contentType',
      options: [
        { value: '', label: tAcademy('filters.allTypes') },
        ...CONTENT_TYPES.map((type) => ({ value: type, label: tAcademy(`types.${type}`) })),
      ],
      value: contentType,
      onChange: (value: string) => {
        setContentType(value);
        updateFilters({ contentType: value });
      },
      width: 'w-28',
    },
    {
      key: 'year',
      options: yearOptions,
      value: year,
      onChange: (value: string) => {
        setYear(value);
        updateFilters({ year: value });
      },
      width: 'w-24',
    },
    {
      key: 'published',
      options: [
        { value: '', label: tAcademy('filters.all') },
        { value: 'true', label: t('status.published') },
        { value: 'false', label: t('status.draft') },
      ],
      value: published,
      onChange: (value: string) => {
        setPublished(value);
        updateFilters({ published: value });
      },
      width: 'w-28',
    },
  ], [contentType, year, published, yearOptions, tAcademy, t, updateFilters]);

  const hasActiveFilters = Boolean(search || contentType || year || published);

  // Get content type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'recording':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        );
      case 'gallery':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case 'slides':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
          </svg>
        );
      case 'podcast':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AdminFilterBar
        searchValue={search}
        searchPlaceholder={t('actions.search')}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        newHref="/admin/academy/new"
        newLabel={t('actions.newContent')}
        isLoading={isPending}
      />

      {/* Mobile Card Layout */}
      <div className={`md:hidden transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {initialData.data.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            {tAcademy('noContent')}
          </div>
        ) : (
          <div className="space-y-4">
            {initialData.data.map((content) => (
              <div
                key={content.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 space-y-3"
              >
                {/* Header with icon and title */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-[var(--background)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                    {getTypeIcon(content.content_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--text)] break-words">
                      {content.title}
                    </h3>
                    {content.year && (
                      <p className="text-sm text-[var(--text-muted)] mt-1">{content.year}</p>
                    )}
                  </div>
                </div>

                {/* Content details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">{tAcademy('contentType')}:</span>
                    <Badge variant="default" size="sm">
                      {tAcademy(`types.${content.content_type}`)}
                    </Badge>
                  </div>

                  {content.theme && (
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-muted)]">{tAcademy('theme')}:</span>
                      <span className="text-[var(--text)]">{content.theme}</span>
                    </div>
                  )}

                  {content.duration_minutes && (
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-muted)]">{tAcademy('duration')}:</span>
                      <span className="text-[var(--text)]">{content.duration_minutes} min</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">{tAcademy('isPublished')}:</span>
                    <Badge
                      variant={content.is_published ? 'success' : 'default'}
                      size="sm"
                    >
                      {content.is_published ? t('status.published') : t('status.draft')}
                    </Badge>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                  <Link href={`/admin/academy/${content.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start" title={t('actions.edit')}>
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      {t('actions.edit')}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(content)}
                    title={content.is_published ? t('actions.unpublish') : t('actions.publish')}
                  >
                    {content.is_published ? (
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(content)}
                    title={t('actions.delete')}
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className={`hidden md:block transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tAcademy('contentTitle')}</TableHead>
              <TableHead>{tAcademy('contentType')}</TableHead>
              <TableHead className="hidden md:table-cell">{tAcademy('theme')}</TableHead>
              <TableHead className="hidden lg:table-cell">{tAcademy('duration')}</TableHead>
              <TableHead>{tAcademy('isPublished')}</TableHead>
              <TableHead width="120px">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.data.length === 0 ? (
              <TableEmpty colSpan={6} message={tAcademy('noContent')} />
            ) : (
              initialData.data.map((content) => (
                <TableRow key={content.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[var(--background)] flex items-center justify-center text-[var(--text-muted)]">
                        {getTypeIcon(content.content_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text)] truncate">
                          {content.title}
                        </p>
                        {content.year && (
                          <span className="text-xs text-[var(--text-muted)]">{content.year}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" size="sm">
                      {tAcademy(`types.${content.content_type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {content.theme ? (
                      <span className="text-[var(--text-muted)]">{content.theme}</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {content.duration_minutes ? (
                      <span className="text-[var(--text-muted)]">{content.duration_minutes} min</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={content.is_published ? 'success' : 'default'}
                      size="sm"
                    >
                      {content.is_published ? t('status.published') : t('status.draft')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/academy/${content.id}`}>
                        <Button variant="ghost" size="sm" title={t('actions.edit')}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(content)}
                        title={content.is_published ? t('actions.unpublish') : t('actions.publish')}
                      >
                        {content.is_published ? (
                          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(content)}
                        title={t('actions.delete')}
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {initialData.totalPages > 1 && (
        <Pagination
          currentPage={initialData.page}
          totalPages={initialData.totalPages}
          totalItems={initialData.count}
          itemsPerPage={initialData.pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={tAcademy('confirmDelete')}
        message="This action cannot be undone. All progress tracking for this content will also be removed."
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
