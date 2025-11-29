import { getTranslations } from 'next-intl/server';
import { getAdminPartners, getCategories } from '@/lib/data/admin';
import PartnersClient from './PartnersClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    category?: string;
  }>;
}

export default async function PartnersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.partners');

  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const status = (params.status as 'active' | 'inactive' | 'all') || 'all';
  const category = params.category || '';

  const [partnersData, categories] = await Promise.all([
    getAdminPartners({ page, pageSize: 10, search, status, category }),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Partners List Client Component */}
      <PartnersClient
        initialData={partnersData}
        categories={categories}
        initialFilters={{ search, status, category }}
      />
    </div>
  );
}
