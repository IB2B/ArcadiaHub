'use client';

import { memo, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import SessionTimeout from '@/components/SessionTimeout';
import { useNotifications } from '@/hooks/useNotifications';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(10);

  return (
    <SessionTimeout>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Desktop Sidebar */}
        <Sidebar user={user} />

        {/* Main Content Area */}
        <div className="lg:pl-72 lg:ml-4 lg:mr-4">
          {/* Header */}
          <Header
            user={user}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />

          {/* Page Content */}
          <main className="p-3 sm:p-4 lg:px-4 lg:py-6 pb-16 sm:pb-20 lg:pb-6">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav userRole={user?.role} />
      </div>
    </SessionTimeout>
  );
}

export default memo(DashboardLayout);
