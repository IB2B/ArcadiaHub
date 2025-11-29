import { getTranslations } from 'next-intl/server';
import { getAdminEvents } from '@/lib/data/admin';
import EventsClient from './EventsClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    eventType?: string;
    upcoming?: string;
  }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.events');

  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const eventType = params.eventType || '';
  const upcoming = params.upcoming === 'true';

  const eventsData = await getAdminEvents({
    page,
    pageSize: 10,
    search,
    eventType: eventType || undefined,
    upcoming: upcoming || undefined
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

      {/* Events List Client Component */}
      <EventsClient
        initialData={eventsData}
        initialFilters={{ search, eventType, upcoming }}
      />
    </div>
  );
}
