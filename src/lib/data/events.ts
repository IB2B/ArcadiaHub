'use server';

import { createClient } from '@/lib/database/server';
import { Database } from '@/types/database.types';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];

export async function getEvents(options?: {
  eventType?: string;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ data: Event[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (options?.eventType) {
    query = query.eq('event_type', options.eventType);
  }
  if (options?.upcoming) {
    query = query.gte('start_datetime', new Date().toISOString());
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
    console.error('Error fetching events:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

export async function getUpcomingEvents(limit: number = 5): Promise<Event[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data || [];
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data;
}

export async function createEvent(
  event: EventInsert
): Promise<{ success: boolean; data?: Event; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
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
