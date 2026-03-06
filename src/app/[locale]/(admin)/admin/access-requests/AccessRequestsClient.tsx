'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  type AccessRequest,
  type AccessRequestStatus,
  type GetAccessRequestsResult,
  approveAccessRequest,
  rejectAccessRequest,
  deleteAccessRequest,
} from '@/lib/data/accessRequests';
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
import AccessRequestDetailModal from './AccessRequestDetailModal';

interface AccessRequestsClientProps {
  initialData: GetAccessRequestsResult;
  initialFilters: {
    search: string;
    status: AccessRequestStatus | 'ALL';
  };
}

export default function AccessRequestsClient({ initialData, initialFilters }: AccessRequestsClientProps) {
  const t = useTranslations('admin');
  const tReq = useTranslations('admin.accessRequests');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [search, setSearch] = useState(initialFilters.search);
  const [status, setStatus] = useState<AccessRequestStatus | 'ALL'>(initialFilters.status);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<AccessRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Update URL with filters
  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
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

  // Handle view details
  const handleViewDetails = useCallback((request: AccessRequest) => {
    setSelectedRequest(request);
    setActionNotes('');
    setDetailModalOpen(true);
  }, []);

  // Handle approve
  const handleApprove = useCallback(async () => {
    if (!selectedRequest) return;
    setIsApproving(true);
    try {
      const result = await approveAccessRequest(selectedRequest.id, actionNotes);
      if (result.success) {
        setDetailModalOpen(false);
        setSelectedRequest(null);
        router.refresh();
      }
    } finally {
      setIsApproving(false);
    }
  }, [selectedRequest, actionNotes, router]);

  // Handle reject
  const handleReject = useCallback(async () => {
    if (!selectedRequest) return;
    setIsRejecting(true);
    try {
      const result = await rejectAccessRequest(selectedRequest.id, actionNotes);
      if (result.success) {
        setDetailModalOpen(false);
        setSelectedRequest(null);
        router.refresh();
      }
    } finally {
      setIsRejecting(false);
    }
  }, [selectedRequest, actionNotes, router]);

  // Handle delete
  const handleDeleteClick = useCallback((request: AccessRequest) => {
    setRequestToDelete(request);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAccessRequest(requestToDelete.id);
      router.refresh();
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setRequestToDelete(null);
    }
  }, [requestToDelete, router]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('ALL');
    startTransition(() => {
      router.push('/admin/access-requests');
    });
  }, [router]);

  // Filter configurations
  const filters = useMemo(() => [
    {
      key: 'status',
      options: [
        { value: 'ALL', label: tReq('filters.all') },
        { value: 'PENDING', label: tReq('filters.pending') },
        { value: 'APPROVED', label: tReq('filters.approved') },
        { value: 'REJECTED', label: tReq('filters.rejected') },
      ],
      value: status,
      onChange: (value: string) => {
        setStatus(value as AccessRequestStatus | 'ALL');
        updateFilters({ status: value });
      },
      width: 'w-32',
    },
  ], [status, tReq, updateFilters]);

  const hasActiveFilters = Boolean(search || status !== 'ALL');

  const getStatusBadge = (requestStatus: AccessRequestStatus) => {
    switch (requestStatus) {
      case 'PENDING':
        return <Badge variant="warning" size="sm">{tReq('status.pending')}</Badge>;
      case 'APPROVED':
        return <Badge variant="success" size="sm">{tReq('status.approved')}</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">{tReq('status.rejected')}</Badge>;
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
        isLoading={isPending}
      />

      {/* Requests - Mobile Cards */}
      <div className={`md:hidden transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {initialData.requests.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            {tReq('noRequests')}
          </div>
        ) : (
          <div className="space-y-3">
            {initialData.requests.map((request) => (
              <div
                key={request.id}
                className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      size="md"
                      name={`${request.contact_first_name} ${request.contact_last_name}`}
                      src={request.contact_photo_url || undefined}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">
                        {request.contact_first_name} {request.contact_last_name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {request.contact_email}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="flex items-center gap-2 mb-3 text-sm text-[var(--text-muted)]">
                  {request.company_logo_url && (
                    <img
                      src={request.company_logo_url}
                      alt=""
                      className="w-5 h-5 object-contain rounded"
                    />
                  )}
                  <span className="truncate">{request.company_name}</span>
                  <span className="text-[var(--border)]">•</span>
                  <span className="shrink-0">{format(new Date(request.created_at), 'MMM d')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                    className="flex-1"
                  >
                    {t('actions.view')}
                  </Button>
                  {request.status === 'PENDING' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          approveAccessRequest(request.id).then(() => router.refresh());
                        }}
                        title={tReq('actions.approve')}
                      >
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          rejectAccessRequest(request.id).then(() => router.refresh());
                        }}
                        title={tReq('actions.reject')}
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(request)}
                    title={t('actions.delete')}
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Requests - Desktop Table */}
      <div className={`hidden md:block transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tReq('table.contact')}</TableHead>
              <TableHead>{tReq('table.company')}</TableHead>
              <TableHead>{tReq('table.status')}</TableHead>
              <TableHead>{tReq('table.date')}</TableHead>
              <TableHead width="140px">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.requests.length === 0 ? (
              <TableEmpty colSpan={5} message={tReq('noRequests')} />
            ) : (
              initialData.requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        size="sm"
                        name={`${request.contact_first_name} ${request.contact_last_name}`}
                        src={request.contact_photo_url || undefined}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text)] truncate">
                          {request.contact_first_name} {request.contact_last_name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {request.contact_email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {request.company_logo_url && (
                        <img
                          src={request.company_logo_url}
                          alt=""
                          className="w-6 h-6 object-contain rounded"
                        />
                      )}
                      <span className="text-[var(--text)]">{request.company_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--text-muted)]">
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        title={t('actions.view')}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Button>
                      {request.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionNotes('');
                              approveAccessRequest(request.id).then(() => router.refresh());
                            }}
                            title={tReq('actions.approve')}
                          >
                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionNotes('');
                              rejectAccessRequest(request.id).then(() => router.refresh());
                            }}
                            title={tReq('actions.reject')}
                          >
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(request)}
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
          totalItems={initialData.total}
          itemsPerPage={10}
          onPageChange={handlePageChange}
        />
      )}

      {/* Detail Modal */}
      <AccessRequestDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        notes={actionNotes}
        onNotesChange={setActionNotes}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={tReq('confirmDelete')}
        message={tReq('deleteWarning')}
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
