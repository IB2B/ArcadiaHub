'use server';

import { createClient } from '@/lib/database/server';
import { getCurrentUserProfile } from './profiles';
import { getMyCases, getCaseStats } from './cases';
import { getUpcomingEvents } from './events';
import { getMyNotifications, getUnreadCount } from './notifications';
import { getLatestDocuments } from './documents';
import { Database } from '@/types/database.types';
import { logger } from '@/lib/logger';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Case = Database['public']['Tables']['cases']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export type ActivityFeedItem = {
  id: string;
  type: 'event' | 'case' | 'content' | 'document' | 'announcement' | 'blog';
  title: string;
  description?: string;
  timestamp: Date;
  author?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    status?: string;
    category?: string;
    link?: string;
  };
  image?: string;
};

export type DashboardData = {
  profile: Profile | null;
  stats: {
    activeCases: number;
    pendingCases: number;
    completedCases: number;
    upcomingEvents: number;
    unreadNotifications: number;
    newDocuments: number;
  };
  upcomingEvents: Event[];
  recentCases: Case[];
  notifications: Notification[];
  activityFeed: ActivityFeedItem[];
};

export async function getActivityFeed(options?: {
  limit?: number;
  offset?: number;
  type?: string;
}): Promise<{ data: ActivityFeedItem[]; count: number }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], count: 0 };
  }

  const limit = options?.limit || 10;
  const offset = options?.offset || 0;
  const filterType = options?.type;

  // Fetch enough items to allow client-side filtering and pagination
  const fetchLimit = Math.max(100, (limit + offset) * 5 + 20);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcData, error } = await (supabase as any).rpc('get_activity_feed', {
    p_user_id: user.id,
    p_limit: fetchLimit,
  });

  if (error) {
    logger.error('Error fetching activity feed via RPC:', { error });
    return { data: [], count: 0 };
  }

  // Map RPC type values to ActivityFeedItem type values
  const typeMap: Record<string, ActivityFeedItem['type']> = {
    academy: 'content',
    notification: 'announcement',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activityFeed: ActivityFeedItem[] = (rpcData || []).map((row: any) => {
    const mappedType = typeMap[row.type] ?? (row.type as ActivityFeedItem['type']);
    const meta = row.metadata || {};
    const link =
      row.type === 'blog' ? `/blog/${meta.slug}` :
      row.type === 'case' ? `/cases/${row.id}` :
      row.type === 'event' ? `/events/${row.id}` :
      row.type === 'academy' ? `/academy/${row.id}` :
      undefined;

    return {
      id: `${row.type}-${row.id}`,
      type: mappedType,
      title: row.title,
      description: row.description || undefined,
      timestamp: new Date(row.created_at),
      metadata: {
        category: meta.content_type || meta.event_type,
        link,
      },
    } as ActivityFeedItem;
  });

  if (filterType) {
    activityFeed = activityFeed.filter((item) => item.type === filterType);
  }

  const totalCount = activityFeed.length;
  const paginatedData = activityFeed.slice(offset, offset + limit);

  return { data: paginatedData, count: totalCount };
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      profile: null,
      stats: {
        activeCases: 0,
        pendingCases: 0,
        completedCases: 0,
        upcomingEvents: 0,
        unreadNotifications: 0,
        newDocuments: 0,
      },
      upcomingEvents: [],
      recentCases: [],
      notifications: [],
      activityFeed: [],
    };
  }

  // Fetch all data in parallel
  const results = await Promise.allSettled([
    getCurrentUserProfile(),
    getCaseStats(user.id),
    getUpcomingEvents(5),
    getMyCases({ limit: 5 }),
    getMyNotifications({ limit: 10 }),
    getUnreadCount(),
    getLatestDocuments(3),
  ]);

  const getValue = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
    result.status === 'fulfilled' ? result.value : fallback;

  const profile = getValue(results[0] as PromiseSettledResult<Profile | null>, null);
  const caseStats = getValue(results[1] as PromiseSettledResult<{ total: number; pending: number; inProgress: number; completed: number }>, { total: 0, pending: 0, inProgress: 0, completed: 0 });
  const upcomingEvents = getValue(results[2] as PromiseSettledResult<Event[]>, []);
  const recentCases = getValue(results[3] as PromiseSettledResult<{ data: Case[]; count: number }>, { data: [], count: 0 });
  const notifications = getValue(results[4] as PromiseSettledResult<Notification[]>, []);
  const unreadCount = getValue(results[5] as PromiseSettledResult<number>, 0);
  const latestDocuments = getValue(results[6] as PromiseSettledResult<Awaited<ReturnType<typeof getLatestDocuments>>>, []);

  // Reuse getActivityFeed to avoid duplicating feed-building logic
  const activityFeedResult = await getActivityFeed({ limit: 10 });

  return {
    profile,
    stats: {
      activeCases: caseStats.inProgress,
      pendingCases: caseStats.pending,
      completedCases: caseStats.completed,
      upcomingEvents: upcomingEvents.length,
      unreadNotifications: unreadCount,
      newDocuments: latestDocuments.length,
    },
    upcomingEvents,
    recentCases: recentCases.data.slice(0, 5),
    notifications,
    activityFeed: activityFeedResult.data,
  };
}
