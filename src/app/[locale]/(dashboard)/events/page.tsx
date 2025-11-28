import { getEvents, getEventStats } from '@/lib/data/events';
import EventsPageClient from './EventsPageClient';

export default async function EventsPage() {
  const { data: events } = await getEvents();
  const stats = await getEventStats();

  return <EventsPageClient events={events} stats={stats} />;
}
