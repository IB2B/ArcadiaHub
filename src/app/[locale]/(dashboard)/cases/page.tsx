import { getCurrentUserProfile } from '@/lib/data/profiles';
import { getMyCases, getCaseStats } from '@/lib/data/cases';
import CasesPageClient from './CasesPageClient';

const PAGE_SIZE = 10;

interface CasesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const status = params.status || '';

  const offset = (page - 1) * PAGE_SIZE;

  const profile = await getCurrentUserProfile();
  const { data: cases, count } = await getMyCases({
    search: search || undefined,
    status: status || undefined,
    limit: PAGE_SIZE,
    offset,
  });
  const stats = await getCaseStats(profile?.id);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <CasesPageClient
      cases={cases}
      stats={stats}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: PAGE_SIZE,
      }}
      initialFilters={{
        search,
        status,
      }}
      userRole={profile?.role || 'PARTNER'}
    />
  );
}
