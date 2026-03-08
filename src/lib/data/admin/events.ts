'use server';

import { createClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';
import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { notifyEventPublished } from '@/lib/services/notificationService';
import { PaginatedResult, ListOptions } from './types';

type Event = Tables<'events'>;

export async function getAdminEvents(options: ListOptions & {
  eventType?: string;
  upcoming?: boolean;
}): Promise<PaginatedResult<Event>> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();
  const { page = 1, pageSize = 10, search, sortBy = 'start_datetime', sortOrder = 'desc', eventType, upcoming } = options;
  const offset = (page - 1) * pageSize;

  let query = supabase.from('events').select('*', { count: 'exact' });

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  if (upcoming) {
    query = query.gte('start_datetime', new Date().toISOString());
  }

  if (search) {
    const safeSearch = search.replace(/[.,()\[\]]/g, '');
    query = query.or(`title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    logger.error('Error fetching admin events:', { error });
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminEvent(id: string): Promise<Event | null> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();

  if (error) {
    logger.error('Error fetching event:', { error });
    return null;
  }

  return data;
}

export async function createEvent(data: TablesInsert<'events'>): Promise<{ success: boolean; error?: string; data?: Event }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { data: result, error } = await supabase.from('events').insert(data).select().single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (result) {
    notifyEventPublished({
      id: result.id,
      title: result.title,
      event_type: result.event_type,
      start_datetime: result.start_datetime,
    }).catch((e) => logger.error('Background notification failed', { error: e }));
  }

  revalidatePath('/[locale]/admin/events');
  revalidatePath('/[locale]/events');
  return { success: true, data: result };
}

export async function updateEvent(id: string, data: TablesUpdate<'events'>): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('events')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/events');
  revalidatePath('/[locale]/events');
  revalidatePath('/[locale]/events/[id]');
  return { success: true };
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  const supabase = await createClient();

  const { error: regError } = await supabase.from('event_registrations').delete().eq('event_id', id);
  if (regError) return { success: false, error: `Failed to delete event registrations: ${regError.message}` };

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/[locale]/admin/events');
  revalidatePath('/[locale]/events');
  return { success: true };
}
