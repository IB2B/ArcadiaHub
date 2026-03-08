'use server';

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

type Event = Database['public']['Tables']['events']['Row'];

export async function getEvents(options?: {
  eventType?: string;
  upcoming?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Event[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select('id, title, description, event_type, start_datetime, end_datetime, location, meeting_link, recording_url, attachments, created_by, is_published, created_at, updated_at', { count: 'exact' })
    .eq('is_published', true);

  if (options?.eventType) {
    query = query.eq('event_type', options.eventType);
  }
  if (options?.upcoming) {
    query = query.gte('start_datetime', new Date().toISOString());
  }
  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  query = query.order('start_datetime', { ascending: true });

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching events:', { error });
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

const _getUpcomingEvents = unstable_cache(
  async (limit: number): Promise<Event[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error('Error fetching upcoming events:', { error });
      return [];
    }

    return data || [];
  },
  ['upcoming-events'],
  { revalidate: 300, tags: ['events'] }
);

export async function getUpcomingEvents(limit: number = 5): Promise<Event[]> {
  return _getUpcomingEvents(limit);
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, event_type, start_datetime, end_datetime, location, meeting_link, recording_url, attachments, created_by, is_published, created_at, updated_at')
    .eq('id', eventId)
    .single();

  if (error) {
    logger.error('Error fetching event:', { error });
    return null;
  }

  return data;
}

export async function getEventStats(): Promise<{
  total: number;
  upcoming: number;
  thisMonth: number;
}> {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('start_datetime')
    .eq('is_published', true);

  if (error || !data) {
    return { total: 0, upcoming: 0, thisMonth: 0 };
  }

  const upcoming = data.filter((e: { start_datetime: string }) => new Date(e.start_datetime) >= now).length;
  const thisMonth = data.filter((e: { start_datetime: string }) => {
    const eventDate = new Date(e.start_datetime);
    return eventDate >= new Date(startOfMonth) && eventDate <= new Date(endOfMonth);
  }).length;

  return {
    total: data.length,
    upcoming,
    thisMonth,
  };
}
