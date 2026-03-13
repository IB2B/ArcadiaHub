import { notFound } from 'next/navigation';
import { getEvent, getEventRegistrationStatus } from '@/lib/data/events';
import { getComments } from '@/lib/data/comments';
import { createClient } from '@/lib/database/server';
import EventDetailClient from './EventDetailClient';

interface EventDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: { user } }, event, registration, comments] = await Promise.all([
    supabase.auth.getUser(),
    getEvent(id),
    getEventRegistrationStatus(id),
    getComments('event', id),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <EventDetailClient
      event={event}
      isRegistered={registration.isRegistered}
      registrationCount={registration.registrationCount}
      comments={comments}
      currentUserId={user?.id}
    />
  );
}
