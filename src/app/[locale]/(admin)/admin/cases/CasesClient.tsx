'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Link } from '@/navigation';
import { Tables } from '@/types/database.types';
import { updateCase, deleteCase, type PaginatedResult } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
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

type Case = Tables<'cases'>;
type Profile = Tables<'profiles'>;
type CaseWithPartner = Case & { partner?: Profile };

interface CasesClientProps {
  initialData: PaginatedResult<CaseWithPartner>;
  partnerOptions: { value: string; label: string }[];
  initialFilters: {
    search: string;
    status: string;
    partnerId: string;
  };
}

const CASE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const;

export default function CasesClient({ initialData, partnerOptions, initialFilters }: CasesClientProps) {
  const t = useTranslations('admin');
  const tCases = useTranslations('admin.cases');
  const tStatuses = useTranslations('admin.statuses');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [search, setSearch] = useState(initialFilters.search);
  const [status, setStatus] = useState(initialFilters.status);
  const [partnerId, setPartnerId] = useState(initialFilters.partnerId);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<CaseWithPartner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle status change
  const handleStatusChange = useCallback(async (caseItem: CaseWithPartner, newStatus: string) => {
    startTransition(async () => {
      await updateCase(caseItem.id, { status: newStatus }, `Status changed to ${newStatus}`);
      router.refresh();
    });
  }, [router]);

  // Handle delete
  const handleDeleteClick = useCallback((caseItem: CaseWithPartner) => {
    setCaseToDelete(caseItem);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCase(caseToDelete.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCaseToDelete(null);
    }
  }, [caseToDelete, router]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('');
    setPartnerId('');
    startTransition(() => {
      router.push('/admin/cases');
    });
  }, [router]);

  // Filter configurations
  const filters = useMemo(() => [
    {
      key: 'status',
      options: [
        { value: '', label: tCases('filters.all') },
        ...CASE_STATUSES.map((s) => ({ value: s, label: tStatuses(s.toLowerCase()) })),
      ],
      value: status,
      onChange: (value: string) => {
        setStatus(value);
        updateFilters({ status: value });
      },
      width: 'w-32',
    },
    {
      key: 'partnerId',
      options: [
        { value: '', label: tCases('filters.allPartners') },
        ...partnerOptions,
      ],
      value: partnerId,
      onChange: (value: string) => {
        setPartnerId(value);
        updateFilters({ partnerId: value });
      },
      width: 'w-40',
    },
  ], [status, partnerId, partnerOptions, tCases, tStatuses, updateFilters]);

  const hasActiveFilters = Boolean(search || status || partnerId);

  // Get status badge variant
  const getStatusVariant = (caseStatus: string | null): 'default' | 'success' | 'error' | 'warning' => {
    switch (caseStatus) {
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      default:
        return 'default';
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
        newHref="/admin/cases/new"
        newLabel={t('actions.newCase')}
        isLoading={isPending}
      />

      {/* Mobile Card Layout */}
      <div className={`md:hidden transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {initialData.data.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            {tCases('noCases')}
          </div>
        ) : (
          <div className="space-y-4">
            {initialData.data.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] font-mono text-sm">
                      {caseItem.case_code}
                    </p>
                    <p className="text-[var(--text)] mt-1">
                      {caseItem.client_name}
                    </p>
                    {caseItem.partner && (
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {caseItem.partner.company_name || caseItem.partner.email}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={getStatusVariant(caseItem.status)}
                    size="sm"
                  >
                    {caseItem.status ? tStatuses(caseItem.status.toLowerCase()) : tStatuses('pending')}
                  </Badge>
                </div>

                <div className="text-sm text-[var(--text-muted)]">
                  {caseItem.opened_at ? format(new Date(caseItem.opened_at), 'MMM d, yyyy') : '-'}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link href={`/admin/cases/${caseItem.id}`} className="flex-shrink-0">
                    <Button variant="ghost" size="sm" title={t('actions.edit')}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </Button>
                  </Link>
                  <Select
                    options={CASE_STATUSES.map((s) => ({ value: s, label: tStatuses(s.toLowerCase()) }))}
                    value={caseItem.status || 'PENDING'}
                    onChange={(e) => handleStatusChange(caseItem, e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(caseItem)}
                    title={t('actions.delete')}
                    className="flex-shrink-0"
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
              <TableHead>{tCases('caseCode')}</TableHead>
              <TableHead>{tCases('clientName')}</TableHead>
              <TableHead>{tCases('partner')}</TableHead>
              <TableHead>{tCases('status')}</TableHead>
              <TableHead>{tCases('openedAt')}</TableHead>
              <TableHead width="150px">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.data.length === 0 ? (
              <TableEmpty colSpan={6} message={tCases('noCases')} />
            ) : (
              initialData.data.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text)] font-mono">
                        {caseItem.case_code}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[var(--text)]">{caseItem.client_name}</span>
                  </TableCell>
                  <TableCell>
                    {caseItem.partner ? (
                      <span className="text-[var(--text-muted)]">
                        {caseItem.partner.company_name || caseItem.partner.email}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(caseItem.status)}
                      size="sm"
                    >
                      {caseItem.status ? tStatuses(caseItem.status.toLowerCase()) : tStatuses('pending')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--text-muted)]">
                      {caseItem.opened_at ? format(new Date(caseItem.opened_at), 'MMM d, yyyy') : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/cases/${caseItem.id}`}>
                        <Button variant="ghost" size="sm" title={t('actions.edit')}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Button>
                      </Link>
                      {/* Quick status change dropdown */}
                      <Select
                        options={CASE_STATUSES.map((s) => ({ value: s, label: tStatuses(s.toLowerCase()) }))}
                        value={caseItem.status || 'PENDING'}
                        onChange={(e) => handleStatusChange(caseItem, e.target.value)}
                        className="w-28 text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(caseItem)}
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
        title={tCases('confirmDelete')}
        message={tCases('deleteWarning')}
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
