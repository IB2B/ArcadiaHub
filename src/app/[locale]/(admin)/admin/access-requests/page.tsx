import { getTranslations } from 'next-intl/server';
import { getAccessRequests, type AccessRequestStatus } from '@/lib/data/admin';
import AccessRequestsClient from './AccessRequestsClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AccessRequestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.accessRequests');

  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const status = (params.status as AccessRequestStatus | 'ALL') || 'ALL';

  const requestsData = await getAccessRequests({ page, limit: 10, search, status });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Access Requests List Client Component */}
      <AccessRequestsClient
        initialData={requestsData}
        initialFilters={{ search, status }}
      />
    </div>
  );
}
