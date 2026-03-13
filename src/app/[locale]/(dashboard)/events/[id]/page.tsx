import { notFound } from 'next/navigation';
import { getEvent, getEventRegistrationStatus } from '@/lib/data/events';
import EventDetailClient from './EventDetailClient';

interface EventDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  const [event, registration] = await Promise.all([
    getEvent(id),
    getEventRegistrationStatus(id),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <EventDetailClient
      event={event}
      isRegistered={registration.isRegistered}
      registrationCount={registration.registrationCount}
    />
  );
}
