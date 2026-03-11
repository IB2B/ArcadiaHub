'use client';

import { useTransition } from 'react';
import { useRouter } from '@/navigation';
import { markAsRead, markAllAsRead } from '@/lib/data/notifications';
import Card, { CardContent } from '@/components/ui/Card';
import type { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface NotificationsPageClientProps {
  notifications: Notification[];
}

function NotificationIcon({ type }: { type: string | null }) {
  switch (type) {
    case 'CASE_UPDATE':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      );
    case 'EVENT':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      );
    case 'CONTENT':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      );
  }
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPageClient({ notifications }: NotificationsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleMarkAsRead(id: string) {
    startTransition(async () => {
      await markAsRead(id);
      router.refresh();
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
      router.refresh();
    });
  }

  function handleClick(notification: Notification) {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link as Parameters<typeof router.push>[0]);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-50"
            style={{ color: 'var(--primary)' }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--muted)' }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: 'var(--foreground)' }}>
              No notifications
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {"You're all caught up!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification)}
              className="w-full text-left rounded-lg border transition-colors hover:opacity-90"
              style={{
                background: notification.is_read ? 'var(--card)' : 'var(--primary-50, color-mix(in srgb, var(--primary) 8%, var(--card)))',
                borderColor: notification.is_read ? 'var(--border)' : 'var(--primary)',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              <div className="flex items-start gap-3 p-4">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium leading-tight"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p
                      className="text-sm mt-0.5 line-clamp-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div
                    className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                    style={{ background: 'var(--primary)' }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
