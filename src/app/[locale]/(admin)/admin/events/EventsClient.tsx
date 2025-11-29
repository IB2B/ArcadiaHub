'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Link } from '@/navigation';
import { Tables } from '@/types/database.types';
import { updateEvent, deleteEvent, type PaginatedResult } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toggle from '@/components/ui/Toggle';
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
  Pagination,
} from '@/components/ui/Table';

type Event = Tables<'events'>;

interface EventsClientProps {
  initialData: PaginatedResult<Event>;
  initialFilters: {
    search: string;
    eventType: string;
    upcoming: boolean;
  };
}

const EVENT_TYPES = ['training', 'workshop', 'webinar', 'physical'] as const;

export default function EventsClient({ initialData, initialFilters }: EventsClientProps) {
  const t = useTranslations('admin');
  const tEvents = useTranslations('admin.events');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [search, setSearch] = useState(initialFilters.search);
  const [eventType, setEventType] = useState(initialFilters.eventType);
  const [upcoming, setUpcoming] = useState(initialFilters.upcoming);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update URL with filters
  const updateFilters = useCallback((updates: Record<string, string | boolean>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    params.delete('page'); // Reset to page 1 when filters change
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
  const handleTogglePublish = useCallback(async (event: Event) => {
    startTransition(async () => {
      await updateEvent(event.id, { is_published: !event.is_published });
      router.refresh();
    });
  }, [router]);

  // Handle delete
  const handleDeleteClick = useCallback((event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEvent(eventToDelete.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  }, [eventToDelete, router]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setEventType('');
    setUpcoming(false);
    startTransition(() => {
      router.push('/admin/events');
    });
  }, [router]);

  // Filter configurations
  const filters = useMemo(() => [
    {
      key: 'eventType',
      options: [
        { value: '', label: tEvents('filters.allTypes') || 'All Types' },
        ...EVENT_TYPES.map((type) => ({ value: type, label: tEvents(`types.${type}`) })),
      ],
      value: eventType,
      onChange: (value: string) => {
        setEventType(value);
        updateFilters({ eventType: value });
      },
      width: 'w-32',
    },
  ], [eventType, tEvents, updateFilters]);

  const hasActiveFilters = Boolean(search || eventType || upcoming);

  // Check if event is past
  const isPastEvent = (event: Event) => {
    return new Date(event.start_datetime) < new Date();
  };

  // Upcoming toggle component
  const upcomingToggle = (
    <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card-hover)] border border-[var(--border)] cursor-pointer">
      <Toggle
        label=""
        checked={upcoming}
        onChange={(e) => {
          setUpcoming(e.target.checked);
          updateFilters({ upcoming: e.target.checked });
        }}
      />
      <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">{tEvents('upcoming')}</span>
    </label>
  );

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
        newHref="/admin/events/new"
        newLabel={t('actions.newEvent')}
        isLoading={isPending}
        extraContent={upcomingToggle}
      />

      {/* Events Table */}
      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tEvents('eventTitle')}</TableHead>
              <TableHead>{tEvents('eventType')}</TableHead>
              <TableHead className="hidden md:table-cell">{tEvents('startDate')}</TableHead>
              <TableHead className="hidden lg:table-cell">{tEvents('location')}</TableHead>
              <TableHead>{tEvents('isPublished')}</TableHead>
              <TableHead width="120px">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.data.length === 0 ? (
              <TableEmpty colSpan={6} message={tEvents('noEvents')} />
            ) : (
              initialData.data.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">
                        {event.title}
                      </p>
                      {isPastEvent(event) && (
                        <span className="text-xs text-amber-600">Past event</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" size="sm">
                      {tEvents(`types.${event.event_type?.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-[var(--text)]">
                      {format(new Date(event.start_datetime), 'MMM d, yyyy')}
                    </span>
                    <br />
                    <span className="text-xs text-[var(--text-muted)]">
                      {format(new Date(event.start_datetime), 'HH:mm')}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {event.location ? (
                      <span className="text-[var(--text-muted)] truncate max-w-[150px] block">
                        {event.location}
                      </span>
                    ) : event.meeting_link ? (
                      <span className="text-blue-600">Online</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={event.is_published ? 'success' : 'default'}
                      size="sm"
                    >
                      {event.is_published ? t('status.published') : t('status.draft')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="ghost" size="sm" title={t('actions.edit')}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(event)}
                        title={event.is_published ? t('actions.unpublish') : t('actions.publish')}
                      >
                        {event.is_published ? (
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
                        onClick={() => handleDeleteClick(event)}
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={tEvents('confirmDelete')}
        message="This action cannot be undone. All event registrations will also be removed."
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
