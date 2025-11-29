import { getTranslations } from 'next-intl/server';
import { getAdminStats } from '@/lib/data/admin';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Link } from '@/navigation';

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  href,
  trend,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href?: string;
  trend?: { value: number; label: string };
  description?: string;
}) {
  const content = (
    <Card hover={!!href} className="h-full">
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-[var(--text-muted)] mb-1">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{value}</p>
            {description && (
              <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <Badge variant={trend.value >= 0 ? 'success' : 'error'} size="sm">
                  {trend.value >= 0 ? '+' : ''}{trend.value}%
                </Badge>
                <span className="text-xs text-[var(--text-muted)]">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// Icons
const icons = {
  partners: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  cases: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  events: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  academy: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  ),
  documents: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  blog: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
};

// Status badge colors
const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'error' | 'default'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  SUSPENDED: 'default',
  CANCELLED: 'error',
};

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin');
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('dashboard.title')}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t('stats.totalPartners')}
          value={stats.totalPartners}
          description={`${stats.activePartners} ${t('stats.active')}`}
          icon={icons.partners}
          href="/admin/partners"
        />
        <StatCard
          title={t('stats.totalCases')}
          value={stats.totalCases}
          icon={icons.cases}
          href="/admin/cases"
        />
        <StatCard
          title={t('stats.totalEvents')}
          value={stats.totalEvents}
          description={`${stats.upcomingEvents} ${t('stats.upcoming')}`}
          icon={icons.events}
          href="/admin/events"
        />
        <StatCard
          title={t('stats.academyContent')}
          value={stats.totalAcademyContent}
          icon={icons.academy}
          href="/admin/academy"
        />
        <StatCard
          title={t('stats.documents')}
          value={stats.totalDocuments}
          icon={icons.documents}
          href="/admin/documents"
        />
        <StatCard
          title={t('stats.blogPosts')}
          value={stats.totalBlogPosts}
          description={`${stats.publishedBlogPosts} ${t('stats.published')}`}
          icon={icons.blog}
          href="/admin/blog"
        />
      </div>

      {/* Cases by Status */}
      <Card>
        <CardHeader title={t('dashboard.casesByStatus')} />
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(stats.casesByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 rounded-lg bg-[var(--card-hover)]">
                <Badge variant={statusColors[status] || 'default'} className="mb-2">
                  {t(`statuses.${status.toLowerCase()}`)}
                </Badge>
                <p className="text-2xl font-bold text-[var(--text)]">{count}</p>
              </div>
            ))}
            {Object.keys(stats.casesByStatus).length === 0 && (
              <p className="col-span-full text-center text-[var(--text-muted)] py-4">
                {t('dashboard.noCases')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title={t('dashboard.quickActions')} />
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/admin/partners/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[var(--text)] text-center">{t('actions.newPartner')}</span>
            </Link>
            <Link
              href="/admin/cases/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[var(--text)] text-center">{t('actions.newCase')}</span>
            </Link>
            <Link
              href="/admin/events/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[var(--text)] text-center">{t('actions.newEvent')}</span>
            </Link>
            <Link
              href="/admin/academy/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[var(--text)] text-center">{t('actions.newContent')}</span>
            </Link>
            <Link
              href="/admin/documents/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[var(--text)] text-center">{t('actions.newDocument')}</span>
            </Link>
            <Link
              href="/admin/blog/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[var(--text)] text-center">{t('actions.newPost')}</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
