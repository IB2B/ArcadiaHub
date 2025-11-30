import { getActivityFeed } from '@/lib/data/dashboard';
import ActivityPageClient from './ActivityPageClient';

const PAGE_SIZE = 10;

interface ActivityPageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
  }>;
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const type = params.type || '';

  const offset = (page - 1) * PAGE_SIZE;

  const { data: activities, count } = await getActivityFeed({
    type: type || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Convert Date objects to ISO strings for serialization
  const serializedActivities = activities.map((item) => ({
    ...item,
    timestamp: item.timestamp.toISOString(),
  }));

  return (
    <ActivityPageClient
      activities={serializedActivities}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: PAGE_SIZE,
      }}
      initialFilters={{
        type,
      }}
    />
  );
}
