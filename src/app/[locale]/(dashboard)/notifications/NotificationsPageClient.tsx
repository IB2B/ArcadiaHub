'use client';

import { useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { markAsRead, markAllAsRead } from '@/lib/data/notifications';
import { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationsPageClientProps {
  notifications: Notification[];
}

function getRelativeTime(dateStr: string | null, t: ReturnType<typeof useTranslations<'notifications'>>): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('justNow');
  if (minutes < 60) return t('minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('hoursAgo', { count: hours });
  return t('daysAgo', { count: Math.floor(hours / 24) });
}

const typeIcons: Record<string, ReactNode> = {
  event_created: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  event_updated: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  case_created: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  case_status_changed: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  document_published: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  academy_content_published: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
  blog_post_published: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
};

const defaultIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

export default function NotificationsPageClient({ notifications }: NotificationsPageClientProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [isPending, startTransition] = useTransition();

  const unreadCount = items.filter((n) => !n.is_read).length;

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  }

  function handleClick(notification: Notification) {
    if (!notification.is_read) {
      handleMarkRead(notification.id);
    }
    if (notification.link) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(notification.link as any);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {t('title')}
          </h1>
          {unreadCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {unreadCount} {t('unread')}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            {t('markAllRead')}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div style={{ color: 'var(--muted-foreground)' }}>{defaultIcon}</div>
              <div>
                <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                  {t('noNotifications')}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {t('noNotificationsDesc')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.map((notification) => (
              <li
                key={notification.id}
                className="flex items-start gap-4 px-4 py-4 transition-colors cursor-pointer"
                style={{
                  background: notification.is_read ? 'transparent' : 'var(--accent)',
                }}
                onClick={() => handleClick(notification)}
              >
                <div
                  className="mt-0.5 shrink-0 rounded-full p-2"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  {typeIcons[notification.type ?? ''] ?? defaultIcon}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug ${notification.is_read ? 'font-normal' : 'font-semibold'}`}
                    style={{ color: 'var(--foreground)' }}
                  >
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {getRelativeTime(notification.created_at, t)}
                  </p>
                </div>

                {!notification.is_read && (
                  <button
                    className="shrink-0 text-xs underline mt-0.5"
                    style={{ color: 'var(--primary)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notification.id);
                    }}
                    disabled={isPending}
                  >
                    {t('markRead')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
