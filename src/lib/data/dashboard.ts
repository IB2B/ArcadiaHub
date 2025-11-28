'use server';

import { createClient } from '@/lib/database/server';
import { getCurrentUserProfile } from './profiles';
import { getMyCases, getCaseStats } from './cases';
import { getUpcomingEvents } from './events';
import { getMyNotifications, getUnreadCount } from './notifications';
import { getLatestAcademyContent } from './academy';
import { getLatestDocuments } from './documents';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Case = Database['public']['Tables']['cases']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type AcademyContent = Database['public']['Tables']['academy_content']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];

export type ActivityFeedItem = {
  id: string;
  type: 'event' | 'case' | 'content' | 'document' | 'announcement';
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
  ] = await Promise.all([
    getCurrentUserProfile(),
    getCaseStats(user.id),
    getUpcomingEvents(5),
    getMyCases(),
    getMyNotifications({ limit: 10 }),
    getUnreadCount(),
    getLatestAcademyContent(3),
    getLatestDocuments(3),
  ]);

  // Build activity feed from various sources
  const activityFeed: ActivityFeedItem[] = [];

  // Add recent cases to feed
  recentCases.slice(0, 3).forEach((c) => {
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

  // Add upcoming events to feed
  upcomingEvents.slice(0, 3).forEach((e) => {
    activityFeed.push({
      id: `event-${e.id}`,
      type: 'event',
      title: e.title,
      description: e.description || undefined,
      timestamp: new Date(e.start_datetime),
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
    recentCases: recentCases.slice(0, 5),
    notifications,
    activityFeed: activityFeed.slice(0, 10),
  };
}
