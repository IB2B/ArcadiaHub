import { getEvents, getEventStats } from '@/lib/data/events';
import { getCurrentUserProfile } from '@/lib/data/profiles';
import EventsPageClient from './EventsPageClient';

const PAGE_SIZE = 9;

interface EventsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    eventType?: string;
    upcoming?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const eventType = params.eventType || '';
  const upcoming = params.upcoming === 'true';

  const offset = (page - 1) * PAGE_SIZE;

  const profile = await getCurrentUserProfile();

  const { data: events, count } = await getEvents({
    search: search || undefined,
    eventType: eventType || undefined,
    upcoming: upcoming || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const stats = await getEventStats();
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <EventsPageClient
      events={events}
      stats={stats}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: PAGE_SIZE,
      }}
      initialFilters={{
        search,
        eventType,
        upcoming: params.upcoming || '',
      }}
      userRole={profile?.role || 'PARTNER'}
    />
  );
}
