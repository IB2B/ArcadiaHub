'use client';

import { memo, useState, useCallback, useRef, useEffect, useMemo, useTransition } from 'react';
import { Link, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { logout } from '@/lib/auth/actions';
import { Database } from '@/types/database.types';

type Notification = Database['public']['Tables']['notifications']['Row'];

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
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error)] rounded-full" />
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
                <div className="max-h-80 overflow-y-auto scrollbar-slim">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[var(--text-muted)] text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          if (!notification.is_read && onMarkAsRead) {
                            onMarkAsRead(notification.id);
                          }
                        }}
                        className={`block px-4 py-3 hover:bg-[var(--card-hover)] transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-[var(--primary-light)]' : ''
                        }`}
                      >
                        {notification.link ? (
                          <Link href={notification.link} className="block">
                            <p className="text-sm font-medium text-[var(--text)]">{notification.title}</p>
                            {notification.message && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-[var(--text-light)] mt-1">
                              {formatNotificationTime(notification.created_at)}
                            </p>
                          </Link>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-[var(--text)]">{notification.title}</p>
                            {notification.message && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-[var(--text-light)] mt-1">
                              {formatNotificationTime(notification.created_at)}
                            </p>
                          </>
                        )}
                      </div>
                    ))
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
                    className="block w-full px-4 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
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
