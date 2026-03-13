'use server';

import { createClient } from '@/lib/database/server';
import { getCurrentUserProfile } from './profiles';
import { getMyCases, getCaseStats } from './cases';
import { getUpcomingEvents } from './events';
import { getMyNotifications, getUnreadCount } from './notifications';
import { getLatestAcademyContent } from './academy';
import { getLatestDocuments } from './documents';
import { getLatestBlogPosts } from './blog';
// Note: getActivityFeed uses activity_feed_view directly (BUG-6)
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Case = Database['public']['Tables']['cases']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type AcademyContent = Database['public']['Tables']['academy_content']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

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

  // Single query via UNION ALL view (BUG-6 fix)
  let query = (supabase as any)
    .from('activity_feed_view')
    .select('*', { count: 'exact' })
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order('feed_timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filterType) {
    query = query.eq('feed_type', filterType);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching activity feed:', error);
    return { data: [], count: 0 };
  }

  const activityFeed: ActivityFeedItem[] = (data || []).map((row: any) => ({
    id: `${row.feed_type}-${row.id}`,
    type: row.feed_type as ActivityFeedItem['type'],
    title: row.title,
    description: row.description || undefined,
    timestamp: new Date(row.feed_timestamp),
    image: row.feed_image || undefined,
    metadata: {
      status: row.feed_type === 'case' ? row.feed_meta : undefined,
      category: row.feed_type !== 'case' ? row.feed_meta : undefined,
      link: row.feed_link || undefined,
    },
  }));

  return { data: activityFeed, count: count || 0 };
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
  const [
    profile,
    caseStats,
    upcomingEvents,
    recentCases,
    notifications,
    unreadCount,
    latestContent,
    latestDocuments,
    latestBlogPosts,
  ] = await Promise.all([
    getCurrentUserProfile(),
    getCaseStats(user.id),
    getUpcomingEvents(5),
    getMyCases({ limit: 5 }),
    getMyNotifications({ limit: 10 }),
    getUnreadCount(),
    getLatestAcademyContent(3),
    getLatestDocuments(3),
    getLatestBlogPosts(3),
  ]);

  // Build activity feed from various sources
  const activityFeed: ActivityFeedItem[] = [];

  // Add recent cases to feed
  recentCases.data.slice(0, 3).forEach((c) => {
    activityFeed.push({
      id: `case-${c.id}`,
      type: 'case',
      title: `Case ${c.case_code}: ${c.client_name}`,
      description: c.notes || undefined,
      timestamp: new Date(c.updated_at || c.created_at || new Date()),
      metadata: {
        status: c.status || 'PENDING',
      },
    });
  });

  // Add upcoming events to feed (use created_at for sorting, not the event date)
  upcomingEvents.slice(0, 3).forEach((e) => {
    activityFeed.push({
      id: `event-${e.id}`,
      type: 'event',
      title: e.title,
      description: e.description || undefined,
      timestamp: new Date(e.created_at || new Date()),
      metadata: {
        category: e.event_type,
      },
    });
  });

  // Add latest content to feed
  latestContent.forEach((c) => {
    activityFeed.push({
      id: `content-${c.id}`,
      type: 'content',
      title: c.title,
      description: c.description || undefined,
      timestamp: new Date(c.created_at || new Date()),
      image: c.thumbnail_url || undefined,
      metadata: {
        category: c.content_type,
      },
    });
  });

  // Add latest documents to feed
  latestDocuments.forEach((d) => {
    activityFeed.push({
      id: `document-${d.id}`,
      type: 'document',
      title: d.title,
      description: d.description || undefined,
      timestamp: new Date(d.created_at || new Date()),
      metadata: {
        category: d.category,
      },
    });
  });

  // Add latest blog posts to feed
  latestBlogPosts.forEach((b) => {
    activityFeed.push({
      id: `blog-${b.id}`,
      type: 'blog',
      title: b.title,
      description: b.excerpt || undefined,
      timestamp: new Date(b.published_at || b.created_at || new Date()),
      image: b.featured_image || undefined,
      metadata: {
        category: b.category || undefined,
        link: `/blog/${b.slug}`,
      },
    });
  });

  // Sort feed by timestamp (newest first)
  activityFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
    activityFeed: activityFeed.slice(0, 10),
  };
}
