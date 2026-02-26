import { getPartners, getCurrentUserProfile } from '@/lib/data/profiles';
import CommunityPageClient from './CommunityPageClient';

const PAGE_SIZE = 12;

interface CommunityPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const category = params.category || '';

  const offset = (page - 1) * PAGE_SIZE;

  const profile = await getCurrentUserProfile();

  const { data: partners, count } = await getPartners({
    isActive: true,
    search: search || undefined,
    category: category || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <CommunityPageClient
      partners={partners}
      totalCount={count}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: PAGE_SIZE,
      }}
      initialFilters={{
        search,
        category,
      }}
      userRole={profile?.role || 'PARTNER'}
    />
  );
}
