'use client';

import { useState, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { Tables } from '@/types/database.types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import AdminFilterBar from '@/components/admin/AdminFilterBar';
import CreateUserModal from '../partners/CreateUserModal';

type Profile = Tables<'profiles'>;

interface TeamClientProps {
  partners: Profile[];
  total: number;
  totalPages: number;
  currentPage: number;
  initialSearch: string;
  currentUserRole: 'ADMIN' | 'COMMERCIAL';
  currentUserId: string;
}

export default function TeamClient({
  partners,
  total,
  totalPages,
  currentPage,
  initialSearch,
  currentUserRole,
  currentUserId,
}: TeamClientProps) {
  const t = useTranslations('admin.team');
  const tSubUsers = useTranslations('subUsers');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(initialSearch);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.delete('page');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams, searchInput]);

  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [router, searchParams]);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <AdminFilterBar
          searchValue={searchInput}
          searchPlaceholder={t('searchPlaceholder')}
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearch}
        />
        <Button onClick={() => setCreateModalOpen(true)} size="sm">
          {tSubUsers('createUser')}
        </Button>
      </div>

      <div className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('createdBy')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.length === 0 ? (
              <TableEmpty colSpan={5} message={t('noPartners')} />
            ) : (
              partners.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-[var(--card-hover)]"
                  onClick={() => router.push(`/admin/partners/${p.id}`)}
                >
                  <TableCell>
                    <span className="text-sm font-medium text-[var(--text)]">
                      {p.company_name || `${p.contact_first_name ?? ''} ${p.contact_last_name ?? ''}`.trim() || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--text-muted)]">{p.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">{p.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? 'success' : 'default'} size="sm">
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-[var(--text-muted)]">
                      {p.created_by === currentUserId ? 'You' : p.created_by ? 'Other' : '—'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={20}
          onPageChange={handlePageChange}
        />
      )}

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          setCreateModalOpen(false);
          router.refresh();
        }}
        currentUserRole={currentUserRole}
        prefilledCommercialId={currentUserRole === 'COMMERCIAL' ? currentUserId : undefined}
        prefilledRole="PARTNER"
      />
    </>
  );
}
