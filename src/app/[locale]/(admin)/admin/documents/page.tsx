import { getTranslations } from 'next-intl/server';
import { getAdminDocuments } from '@/lib/data/admin';
import DocumentsClient from './DocumentsClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    published?: string;
  }>;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.documents');

  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const category = params.category || '';
  const published = params.published === 'true' ? true : params.published === 'false' ? false : undefined;

  const documentsData = await getAdminDocuments({
    page,
    pageSize: 10,
    search,
    category: category || undefined,
    published,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Documents List Client Component */}
      <DocumentsClient
        initialData={documentsData}
        initialFilters={{ search, category, published: params.published || '' }}
      />
    </div>
  );
}
