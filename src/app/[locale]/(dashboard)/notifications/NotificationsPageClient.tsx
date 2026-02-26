'use client';

import { useState, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import { formatDistanceToNow } from 'date-fns';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { markAsRead, markAllAsRead } from '@/lib/data/notifications';
import { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationsPageClientProps {
  notifications: Notification[];
}

const icons = {
  bell: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
};

function formatTime(createdAt: string | null): string {
  if (!createdAt) return '';
  try {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  } catch {
    return '';
  }
}

export default function NotificationsPageClient({ notifications: initialNotifications }: NotificationsPageClientProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const handleMarkAsRead = useCallback(
    (id: string) => {
      startTransition(async () => {
        const result = await markAsRead(id);
        if (result.success) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
          );
        }
      });
    },
    []
  );

  const handleMarkAllAsRead = useCallback(() => {
    startTransition(async () => {
      const result = await markAllAsRead();
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        router.refresh();
      }
    });
  }, [router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
            {icons.bell}
          </div>
          <div>
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
              {t('title')}
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-[var(--text-muted)]">
                {t('unreadCount', { count: unreadCount })}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
          >
            {icons.check}
            <span className="ml-1.5">{t('markAllRead')}</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
          }`}
        >
          {t('all')} ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-hover)]'
          }`}
        >
          {t('unread')} ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className={`space-y-2 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
        {filtered.length > 0 ? (
          filtered.map((notification) => {
            const content = (
              <Card
                hover
                className={`group ${!notification.is_read ? 'border-l-4 border-l-[var(--primary)]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-[var(--text)]">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <Badge variant="primary" size="sm">
                          {t('new')}
                        </Badge>
                      )}
                    </div>
                    {notification.message && (
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-light)] mt-1.5">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="flex-shrink-0 p-1.5 rounded-lg text-[var(--text-light)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                      title={t('markRead')}
                    >
                      {icons.check}
                    </button>
                  )}
                </div>
              </Card>
            );

            if (notification.link) {
              return (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className="block"
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  {content}
                </Link>
              );
            }

            return <div key={notification.id}>{content}</div>;
          })
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="text-[var(--text-light)] mb-4">{icons.empty}</div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
                {t('noNotifications')}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {filter === 'unread' ? t('noUnread') : t('noNotificationsYet')}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
