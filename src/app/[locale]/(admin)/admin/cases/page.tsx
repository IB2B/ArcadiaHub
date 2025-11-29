import { getTranslations } from 'next-intl/server';
import { getAdminCases, getPartnerOptions } from '@/lib/data/admin';
import CasesClient from './CasesClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    partnerId?: string;
  }>;
}

export default async function CasesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.cases');

  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const status = params.status || '';
  const partnerId = params.partnerId || '';

  const [casesData, partnerOptions] = await Promise.all([
    getAdminCases({ page, pageSize: 10, search, status, partnerId }),
    getPartnerOptions(),
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

      {/* Cases List Client Component */}
      <CasesClient
        initialData={casesData}
        partnerOptions={partnerOptions}
        initialFilters={{ search, status, partnerId }}
      />
    </div>
  );
}
