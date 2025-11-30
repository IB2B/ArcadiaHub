import { getDocuments, getDocumentStats } from '@/lib/data/documents';
import DocumentsPageClient from './DocumentsPageClient';

const PAGE_SIZE = 12;

interface DocumentsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const category = params.category || '';

  const offset = (page - 1) * PAGE_SIZE;

  const { data: documents, count } = await getDocuments({
    search: search || undefined,
    category: category || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const stats = await getDocumentStats();
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <DocumentsPageClient
      documents={documents}
      stats={stats}
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
    />
  );
}
