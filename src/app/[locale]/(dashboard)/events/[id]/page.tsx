import { notFound } from 'next/navigation';
import { getEvent, getEventRegistrationInfo, registerForEvent, unregisterFromEvent } from '@/lib/data/events';
import EventDetailClient from './EventDetailClient';

interface EventDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const [event, registrationInfo] = await Promise.all([
    getEvent(id),
    getEventRegistrationInfo(id),
  ]);

  if (!event) {
    notFound();
  }

  const registerAction = registerForEvent.bind(null, id);
  const unregisterAction = unregisterFromEvent.bind(null, id);

  return (
    <EventDetailClient
      event={event}
      isRegistered={registrationInfo.isRegistered}
      registrationCount={registrationInfo.count}
      registerAction={registerAction}
      unregisterAction={unregisterAction}
    />
  );
}
