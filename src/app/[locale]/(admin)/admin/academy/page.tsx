import { getTranslations } from 'next-intl/server';
import { getAdminAcademyContent } from '@/lib/data/admin';
import AcademyClient from './AcademyClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    contentType?: string;
    year?: string;
    published?: string;
  }>;
}

export default async function AcademyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.academy');

  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const contentType = params.contentType || '';
  const year = params.year ? parseInt(params.year, 10) : undefined;
  const published = params.published === 'true' ? true : params.published === 'false' ? false : undefined;

  const academyData = await getAdminAcademyContent({
    page,
    pageSize: 10,
    search,
    contentType: contentType || undefined,
    year,
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

      {/* Academy List Client Component */}
      <AcademyClient
        initialData={academyData}
        initialFilters={{ search, contentType, year: year?.toString() || '', published: params.published || '' }}
      />
    </div>
  );
}
