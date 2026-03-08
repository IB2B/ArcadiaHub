'use client';

import { memo, ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import SessionTimeout from '@/components/SessionTimeout';
import { useNotifications } from '@/hooks/useNotifications';
import SuggestionModal from '@/components/dashboard/SuggestionModal';

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
  const [suggestionOpen, setSuggestionOpen] = useState(false);

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

        {/* Floating Feedback Button */}
        <button
          onClick={() => setSuggestionOpen(true)}
          className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 w-12 h-12 bg-[var(--primary)] text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Send feedback"
          title="Send feedback"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </button>

        {/* Suggestion Modal */}
        <SuggestionModal isOpen={suggestionOpen} onClose={() => setSuggestionOpen(false)} />
      </div>
    </SessionTimeout>
  );
}

export default memo(DashboardLayout);
