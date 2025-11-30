import { getAcademyContent, getAcademyStats } from '@/lib/data/academy';
import AcademyPageClient from './AcademyPageClient';

const PAGE_SIZE = 9;

interface AcademyPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    contentType?: string;
    year?: string;
  }>;
}

export default async function AcademyPage({ searchParams }: AcademyPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const contentType = params.contentType || '';
  const year = params.year ? parseInt(params.year, 10) : undefined;

  const offset = (page - 1) * PAGE_SIZE;

  const { data: content, count } = await getAcademyContent({
    search: search || undefined,
    contentType: contentType || undefined,
    year,
    limit: PAGE_SIZE,
    offset,
  });

  const stats = await getAcademyStats();
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <AcademyPageClient
      content={content}
      stats={stats}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: PAGE_SIZE,
      }}
      initialFilters={{
        search,
        contentType,
        year: params.year || '',
      }}
    />
  );
}
