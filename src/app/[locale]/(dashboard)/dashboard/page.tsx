import { format } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { getDashboardData, type ActivityFeedItem } from '@/lib/data/dashboard';
import { getCurrentUserProfile } from '@/lib/data/profiles';
import { StatsCard, TimelineFeed } from '@/components/dashboard';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Link } from '@/navigation';

// Icons for stats
const statsIcons = {
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
  notifications: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  documents: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
};

// Event type badge variants
const eventTypeVariants: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  TRAINING: 'primary',
  WORKSHOP: 'success',
  WEBINAR: 'info',
  PHYSICAL: 'warning',
};

// Event type to translation key mapping
const eventTypeKeys: Record<string, string> = {
  TRAINING: 'training',
  WORKSHOP: 'workshop',
  WEBINAR: 'webinar',
  PHYSICAL: 'physical',
};

// Case status to translation key mapping
const caseStatusKeys: Record<string, string> = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');
  const tCases = await getTranslations('cases');
  const tEvents = await getTranslations('events');
  const dashboardData = await getDashboardData();
  const profile = await getCurrentUserProfile();

  const userName = profile?.contact_first_name || profile?.company_name || 'Partner';

  // Convert activity feed items for the TimelineFeed component
  const feedItems = dashboardData.activityFeed.map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] leading-tight">
            {t('welcome')}, <span className="block xs:inline">{userName}</span>
          </h1>
          <Link href="/cases/new" className="flex-shrink-0">
            <Button size="sm" className="whitespace-nowrap">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden xs:inline">{tCases('newCase')}</span>
              <span className="xs:hidden">{tCommon('new')}</span>
            </Button>
          </Link>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          {t('partnershipUpdate')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title={t('activeCases')}
          value={dashboardData.stats.activeCases + dashboardData.stats.pendingCases}
          icon={statsIcons.cases}
          iconBg="bg-blue-100"
        />
        <StatsCard
          title={t('upcomingEvents')}
          value={dashboardData.stats.upcomingEvents}
          icon={statsIcons.events}
          iconBg="bg-purple-100"
        />
        <StatsCard
          title={t('unreadNotifications')}
          value={dashboardData.stats.unreadNotifications}
          icon={statsIcons.notifications}
          iconBg="bg-amber-100"
        />
        <StatsCard
          title={t('newDocuments')}
          value={dashboardData.stats.newDocuments}
          icon={statsIcons.documents}
          iconBg="bg-green-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Timeline Feed - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--text)]">{t('activityFeed')}</h2>
          </div>
          {feedItems.length > 0 ? (
            <TimelineFeed items={feedItems} />
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-[var(--text-muted)]">
                    {t('noActivity')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Takes 1 column, shows first on mobile */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Upcoming Events */}
          <Card>
            <CardHeader
              title={t('upcomingEvents')}
              action={
                <Link href="/events">
                  <Button variant="ghost" size="sm">{t('seeAll')}</Button>
                </Link>
              }
            />
            <CardContent>
              {dashboardData.upcomingEvents.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {dashboardData.upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
                    >
                      <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex flex-col items-center justify-center text-xs font-bold">
                        <span>{format(new Date(event.start_datetime), 'd')}</span>
                        <span className="text-[9px] sm:text-[10px] font-normal">{format(new Date(event.start_datetime), 'MMM')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-[var(--text)] truncate">{event.title}</p>
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">
                          {format(new Date(event.start_datetime), 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant={eventTypeVariants[event.event_type] || 'default'} size="sm" className="hidden xs:inline-flex">
                        {tEvents(`types.${eventTypeKeys[event.event_type] || event.event_type.toLowerCase()}`)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[var(--text-muted)] text-center py-4">
                  {t('noUpcomingEvents')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Cases */}
          <Card>
            <CardHeader
              title={t('myCases')}
              action={
                <Link href="/cases">
                  <Button variant="ghost" size="sm">{t('seeAll')}</Button>
                </Link>
              }
            />
            <CardContent>
              {dashboardData.recentCases.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {dashboardData.recentCases.slice(0, 3).map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      href={`/cases/${caseItem.id}`}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm text-[var(--text)] truncate">
                          {caseItem.case_code}
                        </p>
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] truncate">
                          {caseItem.client_name}
                        </p>
                      </div>
                      <Badge
                        variant={
                          caseItem.status === 'COMPLETED' ? 'success' :
                          caseItem.status === 'IN_PROGRESS' ? 'info' :
                          caseItem.status === 'PENDING' ? 'warning' : 'default'
                        }
                        size="sm"
                      >
                        {caseItem.status ? tCases(`statuses.${caseStatusKeys[caseItem.status] || caseItem.status.toLowerCase()}`) : ''}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[var(--text-muted)] text-center py-4">
                  {t('noCases')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title={t('quickActions')} />
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/cases/new">
                  <Button variant="outline" size="sm" fullWidth className="text-xs sm:text-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="truncate">{tCases('newCase')}</span>
                  </Button>
                </Link>
                <Link href="/documents">
                  <Button variant="outline" size="sm" fullWidth className="text-xs sm:text-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="truncate">{t('docs')}</span>
                  </Button>
                </Link>
                <Link href="/academy">
                  <Button variant="outline" size="sm" fullWidth className="text-xs sm:text-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                    </svg>
                    <span className="truncate">{t('academy')}</span>
                  </Button>
                </Link>
                <Link href="/community">
                  <Button variant="outline" size="sm" fullWidth className="text-xs sm:text-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="truncate">{t('community')}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
