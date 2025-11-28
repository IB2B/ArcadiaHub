'use client';

import { memo, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

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
  // Mock notifications for demo
  const notifications = [
    {
      id: '1',
      title: 'New Event',
      message: 'Training session scheduled for next week',
      time: '5 min ago',
      read: false,
      type: 'event' as const,
    },
    {
      id: '2',
      title: 'Case Update',
      message: 'Your case #2024-001 has been updated',
      time: '1 hour ago',
      read: false,
      type: 'case' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="lg:pl-72 lg:ml-4 lg:mr-4">
        {/* Header */}
        <Header user={user} notifications={notifications} />

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:px-4 lg:py-6 pb-16 sm:pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default memo(DashboardLayout);
