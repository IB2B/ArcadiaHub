import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/data/events';
import EventDetailClient from './EventDetailClient';

interface EventDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}
