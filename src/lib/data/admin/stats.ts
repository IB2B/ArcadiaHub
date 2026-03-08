'use server';

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/database/server';
import { requireRole } from '@/lib/auth/guards';

export interface AdminStats {
  totalPartners: number;
  activePartners: number;
  totalCases: number;
  casesByStatus: Record<string, number>;
  totalEvents: number;
  upcomingEvents: number;
  totalAcademyContent: number;
  totalDocuments: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
}

const _fetchAdminStats = unstable_cache(
  async (): Promise<AdminStats> => {
    const supabase = await createClient();

    const [
      partnersResult,
      activePartnersResult,
      casesResult,
      eventsResult,
      upcomingEventsResult,
      academyResult,
      documentsResult,
      blogResult,
      publishedBlogResult,
      caseStatusResult,
    ] = (await Promise.allSettled([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PARTNER'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'PARTNER').eq('is_active', true),
      supabase.from('cases').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_datetime', new Date().toISOString()),
      supabase.from('academy_content').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('cases').select('status'),
    ])).map((r) => (r.status === 'fulfilled' ? r.value : { data: null, count: 0, error: null }));

    const casesByStatus: Record<string, number> = {};
    const caseStatusData = caseStatusResult.data as Array<{ status: string | null }> | null;
    if (caseStatusData) {
      caseStatusData.forEach((c) => {
        const status = c.status || 'UNKNOWN';
        casesByStatus[status] = (casesByStatus[status] || 0) + 1;
      });
    }

    return {
      totalPartners: partnersResult.count || 0,
      activePartners: activePartnersResult.count || 0,
      totalCases: casesResult.count || 0,
      casesByStatus,
      totalEvents: eventsResult.count || 0,
      upcomingEvents: upcomingEventsResult.count || 0,
      totalAcademyContent: academyResult.count || 0,
      totalDocuments: documentsResult.count || 0,
      totalBlogPosts: blogResult.count || 0,
      publishedBlogPosts: publishedBlogResult.count || 0,
    };
  },
  ['admin-stats'],
  { revalidate: 60, tags: ['admin-stats'] }
);

export async function getAdminStats(): Promise<AdminStats> {
  await requireRole(['ADMIN', 'COMMERCIAL']);
  return _fetchAdminStats();
}
