'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';

// Icons as simple SVG components for performance
const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  community: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  events: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  academy: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  documents: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  cases: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  blog: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  collapse: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  ),
  expand: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
};

interface NavItemConfig {
  key: string;
  translationKey: string;
  href: string;
  icon: keyof typeof icons;
  badge?: number;
}

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

const navItemsConfig: NavItemConfig[] = [
  { key: 'dashboard', translationKey: 'dashboard', href: '/dashboard', icon: 'dashboard' },
  { key: 'community', translationKey: 'community', href: '/community', icon: 'community' },
  { key: 'events', translationKey: 'calendar', href: '/events', icon: 'events' },
  { key: 'academy', translationKey: 'academy', href: '/academy', icon: 'academy' },
  { key: 'documents', translationKey: 'documents', href: '/documents', icon: 'documents' },
  { key: 'cases', translationKey: 'myCases', href: '/cases', icon: 'cases', badge: 3 },
  { key: 'blog', translationKey: 'blog', href: '/blog', icon: 'blog' },
];

// Admin icon
const adminIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const isActive = useCallback(
    (href: string) => {
      // Remove locale prefix for comparison
      const cleanPath = pathname.replace(/^\/(en|it|fr)/, '');
      return cleanPath === href || cleanPath.startsWith(href + '/');
    },
    [pathname]
  );

  const NavLink = useMemo(
    () =>
      memo(({ item }: { item: NavItemConfig }) => {
        const active = isActive(item.href);
        const label = t(item.translationKey);
        return (
          <Link
            href={item.href}
            className={`
              group flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200
              ${
                active
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]'
              }
            `}
          >
            <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--primary)]'}`}>
              {icons[item.icon]}
            </span>
            {!isCollapsed && (
              <>
                <span className="flex-1 font-medium truncate">{label}</span>
                {item.badge && (
                  <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--error)] text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      }),
    [isActive, isCollapsed, t]
  );

  return (
    <aside
      className={`
        hidden lg:flex flex-col
        fixed left-4 top-4 bottom-4 z-40
        bg-[var(--card)] border border-[var(--border)]
        rounded-2xl shadow-lg
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b border-[var(--border)] ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold gradient-text truncate">Arcadia Hub</h1>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="flex-shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text)] transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? icons.expand : icons.collapse}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-slim">
        {navItemsConfig.map((item) => (
          <NavLink key={item.key} item={item} />
        ))}

        {/* Admin Link - Only visible for ADMIN and COMMERCIAL roles */}
        {user && (user.role === 'ADMIN' || user.role === 'COMMERCIAL') && (
          <>
            <div className="my-2 border-t border-[var(--border)]" />
            <Link
              href="/admin"
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${
                  isActive('/admin')
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]'
                }
              `}
            >
              <span className={`flex-shrink-0 ${isActive('/admin') ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--primary)]'}`}>
                {adminIcon}
              </span>
              {!isCollapsed && (
                <span className="flex-1 font-medium truncate">{t('adminDashboard')}</span>
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Footer - User Profile */}
      <div className={`p-3 border-t border-[var(--border)] ${isCollapsed ? 'flex justify-center' : ''}`}>
        <Link
          href="/settings"
          className={`
            flex items-center gap-3 p-2 rounded-lg
            hover:bg-[var(--card-hover)] transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <Avatar
            size="sm"
            name={user?.name || 'User'}
            src={user?.avatar}
            showStatus
            status="online"
          />
          {!isCollapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user.role}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
