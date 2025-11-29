'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Link } from '@/navigation';
import { Tables } from '@/types/database.types';
import { togglePartnerStatus, deletePartner, type PaginatedResult } from '@/lib/data/admin';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
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

type Profile = Tables<'profiles'>;

interface PartnersClientProps {
  initialData: PaginatedResult<Profile>;
  categories: string[];
  initialFilters: {
    search: string;
    status: string;
    category: string;
  };
}

export default function PartnersClient({ initialData, categories, initialFilters }: PartnersClientProps) {
  const t = useTranslations('admin');
  const tPartners = useTranslations('admin.partners');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [search, setSearch] = useState(initialFilters.search);
  const [status, setStatus] = useState(initialFilters.status);
  const [category, setCategory] = useState(initialFilters.category);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Profile | null>(null);
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

  // Handle status toggle
  const handleToggleStatus = useCallback(async (partner: Profile) => {
    const newStatus = !partner.is_active;
    startTransition(async () => {
      await togglePartnerStatus(partner.id, newStatus);
      router.refresh();
    });
  }, [router]);

  // Handle delete
  const handleDeleteClick = useCallback((partner: Profile) => {
    setPartnerToDelete(partner);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!partnerToDelete) return;
    setIsDeleting(true);
    try {
      await deletePartner(partnerToDelete.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setPartnerToDelete(null);
    }
  }, [partnerToDelete, router]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('all');
    setCategory('');
    startTransition(() => {
      router.push('/admin/partners');
    });
  }, [router]);

  // Filter configurations
  const filters = useMemo(() => [
    {
      key: 'status',
      options: [
        { value: 'all', label: tPartners('filters.all') },
        { value: 'active', label: tPartners('filters.active') },
        { value: 'inactive', label: tPartners('filters.inactive') },
      ],
      value: status,
      onChange: (value: string) => {
        setStatus(value);
        updateFilters({ status: value });
      },
      width: 'w-28',
    },
    {
      key: 'category',
      options: [
        { value: '', label: t('actions.filter') },
        ...categories.map((cat) => ({ value: cat, label: cat })),
      ],
      value: category,
      onChange: (value: string) => {
        setCategory(value);
        updateFilters({ category: value });
      },
      width: 'w-32',
    },
  ], [status, category, categories, tPartners, t, updateFilters]);

  const hasActiveFilters = Boolean(search || status !== 'all' || category);

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
        newHref="/admin/partners/new"
        newLabel={t('actions.newPartner')}
        isLoading={isPending}
      />

      {/* Partners Table */}
      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tPartners('companyName')}</TableHead>
              <TableHead className="hidden md:table-cell">{tPartners('email')}</TableHead>
              <TableHead className="hidden lg:table-cell">{tPartners('category')}</TableHead>
              <TableHead>{tPartners('status')}</TableHead>
              <TableHead className="hidden sm:table-cell">{tPartners('createdAt')}</TableHead>
              <TableHead width="120px">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.data.length === 0 ? (
              <TableEmpty colSpan={6} message={tPartners('noPartners')} />
            ) : (
              initialData.data.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        name={partner.company_name || partner.email}
                        src={partner.logo_url || undefined}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text)] truncate">
                          {partner.company_name || 'No company name'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate md:hidden">
                          {partner.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-[var(--text-muted)]">{partner.email}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {partner.category ? (
                      <Badge variant="default" size="sm">{partner.category}</Badge>
                    ) : (
                      <span className="text-[var(--text-muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={partner.is_active ? 'success' : 'error'}
                      size="sm"
                    >
                      {partner.is_active ? tPartners('active') : tPartners('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-[var(--text-muted)]">
                      {partner.created_at ? format(new Date(partner.created_at), 'MMM d, yyyy') : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/partners/${partner.id}`}>
                        <Button variant="ghost" size="sm" title={t('actions.edit')}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(partner)}
                        title={partner.is_active ? t('actions.deactivate') : t('actions.activate')}
                      >
                        {partner.is_active ? (
                          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(partner)}
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
        title={tPartners('confirmDelete')}
        message={tPartners('deleteWarning')}
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
