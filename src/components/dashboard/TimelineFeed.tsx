'use client';

import { memo, useMemo, ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { format, isToday, isYesterday, formatDistanceToNow, Locale } from 'date-fns';
import { enUS, fr, it } from 'date-fns/locale';
import { Link } from '@/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';

// Date-fns locale mapping
const dateLocales: Record<string, Locale> = {
  en: enUS,
  fr: fr,
  it: it,
};

// Icons
const icons = {
  event: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  case: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  content: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
    </svg>
  ),
  document: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  announcement: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ),
  blog: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
};

type FeedItemType = 'event' | 'case' | 'content' | 'document' | 'announcement' | 'blog';

export interface FeedItem {
  id: string;
  type: FeedItemType;
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
}

interface TimelineFeedProps {
  items: FeedItem[];
  loading?: boolean;
  emptyMessage?: string;
}

const typeColors: Record<FeedItemType, { bg: string; icon: string; badge: 'primary' | 'success' | 'warning' | 'info' | 'error' }> = {
  event: { bg: 'bg-blue-100', icon: 'text-blue-600', badge: 'primary' },
  case: { bg: 'bg-amber-100', icon: 'text-amber-600', badge: 'warning' },
  content: { bg: 'bg-purple-100', icon: 'text-purple-600', badge: 'info' },
  document: { bg: 'bg-green-100', icon: 'text-green-600', badge: 'success' },
  announcement: { bg: 'bg-red-100', icon: 'text-red-600', badge: 'error' },
  blog: { bg: 'bg-pink-100', icon: 'text-pink-600', badge: 'info' },
};

const typeKeys: Record<FeedItemType, string> = {
  event: 'event',
  case: 'case',
  content: 'content',
  document: 'document',
  announcement: 'announcement',
  blog: 'blog',
};

// Get link URL based on item type and ID
function getItemLink(item: FeedItem): string | null {
  // If metadata has an explicit link, use it
  if (item.metadata?.link) {
    return item.metadata.link;
  }

  // Extract the actual ID from the prefixed ID (e.g., "case-123" -> "123")
  const actualId = item.id.split('-').slice(1).join('-');

  switch (item.type) {
    case 'case':
      return `/cases/${actualId}`;
    case 'event':
      return `/events/${actualId}`;
    case 'blog':
      return `/blog`; // Blog items should have metadata.link with slug
    case 'content':
      return `/academy/${actualId}`;
    case 'document':
      return `/documents/${actualId}`;
    case 'announcement':
      return null; // Announcements don't have a detail page
    default:
      return null;
  }
}

function formatTimestamp(date: Date, yesterdayLabel: string, locale: Locale): string {
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true, locale });
  }
  if (isYesterday(date)) {
    return yesterdayLabel.replace('[TIME]', format(date, 'h:mm a', { locale }));
  }
  return format(date, 'PPP', { locale });
}

// Memoized Feed Item Component
const FeedItemCard = memo(function FeedItemCard({ item, typeLabel, yesterdayLabel, locale }: { item: FeedItem; typeLabel: string; yesterdayLabel: string; locale: Locale }) {
  const colors = typeColors[item.type];
  const formattedTime = useMemo(() => formatTimestamp(item.timestamp, yesterdayLabel, locale), [item.timestamp, yesterdayLabel, locale]);
  const link = useMemo(() => getItemLink(item), [item]);

  const cardContent = (
    <Card hover className="group cursor-pointer">
      <CardContent>
        <div className="flex gap-3 sm:gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${colors.bg} ${colors.icon} flex items-center justify-center`}>
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">
              {icons[item.type]}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-1 xs:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Badge variant={colors.badge} size="sm">
                  {typeLabel}
                </Badge>
                <span className="text-[10px] sm:text-xs text-[var(--text-light)]">{formattedTime}</span>
              </div>
              {item.metadata?.status && (
                <Badge variant="default" size="sm" className="self-start">
                  {item.metadata.status}
                </Badge>
              )}
            </div>

            <h4 className="mt-1.5 sm:mt-2 text-sm sm:text-base font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
              {item.title}
            </h4>

            {item.description && (
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Image Preview */}
            {item.image && (
              <div className="mt-2 sm:mt-3 rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-32 sm:h-40 object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Footer */}
            {item.author && (
              <div className="mt-2 sm:mt-3 flex items-center gap-2">
                <Avatar size="xs" name={item.author.name} src={item.author.avatar} />
                <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">{item.author.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Wrap in Link if we have a valid link
  if (link) {
    return (
      <Link href={link} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
});

// Loading Skeleton
const FeedSkeleton = memo(function FeedSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="flex gap-3 sm:gap-4 animate-pulse">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--card-hover)]" />
          <div className="flex-1 space-y-2 sm:space-y-3">
            <div className="flex gap-1.5 sm:gap-2">
              <div className="h-4 sm:h-5 w-16 sm:w-20 rounded bg-[var(--card-hover)]" />
              <div className="h-4 sm:h-5 w-12 sm:w-16 rounded bg-[var(--card-hover)]" />
            </div>
            <div className="h-4 sm:h-5 w-3/4 rounded bg-[var(--card-hover)]" />
            <div className="h-3 sm:h-4 w-1/2 rounded bg-[var(--card-hover)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

function TimelineFeed({ items, loading = false, emptyMessage }: TimelineFeedProps) {
  const t = useTranslations('dashboard');
  const localeCode = useLocale();
  const dateLocale = dateLocales[localeCode] || enUS;

  const resolvedEmptyMessage = emptyMessage || t('noActivity');
  const yesterdayLabel = t('yesterdayAt');

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map((i) => (
          <FeedSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-[var(--card-hover)] flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-muted)]">{resolvedEmptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item) => (
        <FeedItemCard
          key={item.id}
          item={item}
          typeLabel={t(`feedTypes.${typeKeys[item.type]}`)}
          yesterdayLabel={yesterdayLabel}
          locale={dateLocale}
        />
      ))}
    </div>
  );
}

export default memo(TimelineFeed);
