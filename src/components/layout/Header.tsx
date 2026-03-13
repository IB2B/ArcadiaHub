'use client';

import React, { memo, useState, useCallback, useRef, useEffect, useMemo, useTransition } from 'react';
import { Link, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { logout } from '@/lib/auth/actions';
import { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

const notificationTypeConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  MENTION: {
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-9 9m4.5-1.206a8.959 8.959 0 0 1-4.5 1.207" />
      </svg>
    ),
  },
  CASE_UPDATE: {
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
  },
  EVENT: {
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
  CONTENT: {
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  SUGGESTION_REPLY: {
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  INFO: {
    color: 'bg-[var(--primary-light)] text-[var(--primary)]',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    ),
  },
};

const icons = {
  bell: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  back: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevron: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
};

interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  notifications?: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

function Header({ user, notifications = [], unreadCount: propUnreadCount, onMarkAsRead, onMarkAllAsRead }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useTranslations('nav');

  const handleLogout = useCallback(() => {
    startLogoutTransition(async () => {
      await logout();
    });
  }, []);

  const unreadCount = propUnreadCount ?? notifications.filter((n) => !n.is_read).length;

  const formatNotificationTime = useCallback((createdAt: string | null) => {
    if (!createdAt) return '';
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch {
      return '';
    }
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
    setShowProfile(false);
  }, []);

  const toggleProfile = useCallback(() => {
    setShowProfile((prev) => !prev);
    setShowNotifications(false);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse breadcrumbs from pathname
  const { breadcrumbs, backNav } = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    // If we're at root or dashboard, no breadcrumbs needed
    if (segments.length <= 1) return { breadcrumbs: [], backNav: null };

    const crumbs: BreadcrumbSegment[] = [];

    // Map segment names to translation keys
    const segmentLabels: Record<string, string> = {
      'dashboard': t('dashboard'),
      'cases': t('myCases'),
      'community': t('community'),
      'events': t('calendar'),
      'academy': t('academy'),
      'documents': t('documents'),
      'blog': t('blog'),
      'profile': t('profile'),
      'settings': t('settings'),
    };

    // Build breadcrumb path
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
      const isSlug = i > 0 && !segmentLabels[segment] && !isUUID;

      currentPath += `/${segment}`;

      // Skip slugs/IDs in breadcrumb display but include in path
      if (isUUID || isSlug) continue;

      const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({
        label,
        href: currentPath,
      });
    }

    // Get back navigation (go to parent)
    let backNavigation = null;
    if (segments.length >= 2) {
      const parentSegments = segments.slice(0, -1);
      const parentPath = '/' + parentSegments.join('/');
      const parentLabel = segmentLabels[parentSegments[parentSegments.length - 1]] || parentSegments[parentSegments.length - 1];
      backNavigation = {
        href: parentPath,
        label: parentLabel,
      };
    }

    return { breadcrumbs: crumbs, backNav: backNavigation };
  }, [pathname, t]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--header-bg)] border-b border-[var(--border)] lg:static lg:mt-4 lg:rounded-2xl lg:border lg:shadow-sm">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
        {/* Left: Logo/Back Navigation & Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Back Navigation */}
          {backNav ? (
            <Link
              href={backNav.href}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-sm border shrink-0 border-[var(--border)] text-[var(--text-muted)] bg-[var(--card-hover)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              {icons.back}
              <span className="hidden sm:inline">{backNav.label}</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="lg:hidden">
              <span className="text-lg sm:text-xl font-bold gradient-text">Arcadia</span>
            </Link>
          )}

          {/* Breadcrumbs - Desktop only */}
          {breadcrumbs.length > 1 && (
            <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                  {index > 0 && (
                    <span className="text-[var(--text-muted)]">{icons.chevron}</span>
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium truncate text-[var(--text)]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="transition-colors truncate text-[var(--text-muted)] hover:text-[var(--primary)]"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] transition-colors"
              aria-label="Notifications"
            >
              {icons.bell}
              {unreadCount > 0 && (
                unreadCount > 9 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    9+
                  </span>
                ) : (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-[320px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden animate-slideUp z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)]">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="primary" size="sm">{unreadCount} new</Badge>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-slim divide-y divide-[var(--border)]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-[var(--card-hover)] flex items-center justify-center mx-auto mb-2 text-[var(--text-muted)]">
                        {icons.bell}
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const typeConf = notificationTypeConfig[notification.type] || notificationTypeConfig.INFO;
                      const inner = (
                        <div className="flex gap-3 items-start">
                          {/* Type icon */}
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${typeConf.color}`}>
                            {typeConf.icon}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--text)]'}`}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-[var(--text-light)] mt-1" suppressHydrationWarning>
                              {formatNotificationTime(notification.created_at)}
                            </p>
                          </div>
                          {/* Unread dot */}
                          {!notification.is_read && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5" />
                          )}
                        </div>
                      );

                      return (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (!notification.is_read && onMarkAsRead) {
                              onMarkAsRead(notification.id);
                            }
                          }}
                          className={`px-4 py-3 hover:bg-[var(--card-hover)] transition-colors cursor-pointer ${
                            !notification.is_read ? 'bg-[var(--primary-light)]/40' : ''
                          }`}
                        >
                          {notification.link ? (
                            <Link href={notification.link} className="block" onClick={() => setShowNotifications(false)}>
                              {inner}
                            </Link>
                          ) : inner}
                        </div>
                      );
                    })
                  )}
                </div>
                <Link
                  href="/notifications"
                  className="block px-4 py-3 text-center text-sm font-medium text-[var(--primary)] hover:bg-[var(--card-hover)] border-t border-[var(--border)]"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
            >
              <Avatar size="sm" name={user?.name || 'User'} src={user?.avatar} />
              <span className="hidden sm:block text-sm font-medium text-[var(--text)] max-w-[100px] truncate">
                {user?.name}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-56 max-w-[224px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden animate-slideUp z-50">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="font-medium text-[var(--text)]">{user?.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--card-hover)]"
                  >
                    {t('profile')}
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--card-hover)]"
                  >
                    {t('settings')}
                  </Link>
                </div>
                <div className="border-t border-[var(--border)] py-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--card-hover)] disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Signing out...' : t('signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
