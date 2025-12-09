'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const modules = [
  {
    id: 'dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'cases',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: 'events',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: 'academy',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    ),
  },
  {
    id: 'documents',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'community',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

// Preview content for each module - now with translations
function DashboardPreview({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <div className="text-2xl font-bold text-[var(--text)]">12</div>
          <div className="text-xs text-[var(--text-muted)]">{t('preview.dashboard.activeCases')}</div>
        </div>
        <div className="p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <div className="text-2xl font-bold text-[var(--text)]">3</div>
          <div className="text-xs text-[var(--text-muted)]">{t('preview.dashboard.upcomingEvents')}</div>
        </div>
      </div>
      {/* Activity Feed */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[var(--text)]">{t('preview.dashboard.recentActivity')}</div>
        {[
          { titleKey: 'preview.dashboard.activity1', time: '2h', color: 'bg-[var(--primary)]' },
          { titleKey: 'preview.dashboard.activity2', time: '5h', color: 'bg-green-500' },
          { titleKey: 'preview.dashboard.activity3', time: '1d', color: 'bg-purple-500' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--background)]">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[var(--text)] truncate">{t(item.titleKey)}</div>
              <div className="text-xs text-[var(--text-muted)]">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CasesPreview({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-3">
      {[
        { code: 'PRT-2024-001', clientKey: 'preview.cases.client1', statusKey: 'preview.cases.statusInProgress', statusColor: 'bg-blue-100 text-blue-700' },
        { code: 'PRT-2024-002', clientKey: 'preview.cases.client2', statusKey: 'preview.cases.statusCompleted', statusColor: 'bg-green-100 text-green-700' },
        { code: 'PRT-2024-003', clientKey: 'preview.cases.client3', statusKey: 'preview.cases.statusPending', statusColor: 'bg-amber-100 text-amber-700' },
      ].map((item, i) => (
        <div key={i} className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[var(--primary)]">{item.code}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.statusColor}`}>{t(item.statusKey)}</span>
          </div>
          <div className="text-sm text-[var(--text)]">{t(item.clientKey)}</div>
        </div>
      ))}
      <div className="text-center">
        <span className="text-xs text-[var(--text-muted)]">{t('preview.cases.moreItems')}</span>
      </div>
    </div>
  );
}

function EventsPreview({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-3">
      {[
        { titleKey: 'preview.events.event1', date: '15 Jan 2025', time: '10:00', typeKey: 'preview.events.typeWorkshop', typeColor: 'bg-purple-100 text-purple-700' },
        { titleKey: 'preview.events.event2', date: '22 Jan 2025', time: '14:30', typeKey: 'preview.events.typeWebinar', typeColor: 'bg-green-100 text-green-700' },
        { titleKey: 'preview.events.event3', date: '28 Jan 2025', time: '09:00', typeKey: 'preview.events.typeEvent', typeColor: 'bg-[var(--primary-light)] text-[var(--primary)]' },
      ].map((item, i) => (
        <div key={i} className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]">
          <div className="flex items-start justify-between mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.typeColor}`}>{t(item.typeKey)}</span>
          </div>
          <div className="text-sm font-medium text-[var(--text)] mb-1">{t(item.titleKey)}</div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span>{item.date}</span>
            <span>•</span>
            <span>{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AcademyPreview({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-3">
      {[
        { titleKey: 'preview.academy.content1', typeKey: 'preview.academy.typeVideo', duration: '45 min', thumbnail: 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]' },
        { titleKey: 'preview.academy.content2', typeKey: 'preview.academy.typePDF', duration: '20 pg', thumbnail: 'bg-gradient-to-br from-purple-500 to-pink-500' },
        { titleKey: 'preview.academy.content3', typeKey: 'preview.academy.typePodcast', duration: '32 min', thumbnail: 'bg-gradient-to-br from-green-500 to-teal-500' },
      ].map((item, i) => (
        <div key={i} className="flex gap-3 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
          <div className={`w-16 h-12 rounded-lg ${item.thumbnail} flex items-center justify-center`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--text)] truncate">{t(item.titleKey)}</div>
            <div className="text-xs text-[var(--text-muted)]">{t(item.typeKey)} • {item.duration}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentsPreview({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-3">
        {[
          { key: 'preview.documents.tabAll', active: true },
          { key: 'preview.documents.tabContracts', active: false },
          { key: 'preview.documents.tabMarketing', active: false },
        ].map((tab, i) => (
          <span key={i} className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-colors ${tab.active ? 'bg-[var(--primary)] text-white' : 'bg-[var(--background)] text-[var(--text-muted)] hover:bg-[var(--border)]'}`}>
            {t(tab.key)}
          </span>
        ))}
      </div>
      {[
        { nameKey: 'preview.documents.doc1', size: '2.4 MB', icon: 'text-red-500' },
        { nameKey: 'preview.documents.doc2', size: '8.1 MB', icon: 'text-[var(--primary)]' },
        { nameKey: 'preview.documents.doc3', size: '1.2 MB', icon: 'text-green-500' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
          <div className={`w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center ${item.icon}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[var(--text)] truncate">{t(item.nameKey)}</div>
            <div className="text-xs text-[var(--text-muted)]">{item.size}</div>
          </div>
          <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function CommunityPreview({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder={t('preview.community.searchPlaceholder')} className="w-full pl-9 pr-3 py-1.5 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)]" readOnly />
        </div>
      </div>
      {[
        { nameKey: 'preview.community.partner1', locationKey: 'preview.community.location1', categoryKey: 'preview.community.category1' },
        { nameKey: 'preview.community.partner2', locationKey: 'preview.community.location2', categoryKey: 'preview.community.category2' },
        { nameKey: 'preview.community.partner3', locationKey: 'preview.community.location3', categoryKey: 'preview.community.category3' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold text-sm">
            {t(item.nameKey).charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[var(--text)] truncate">{t(item.nameKey)}</div>
            <div className="text-xs text-[var(--text-muted)]">{t(item.categoryKey)} • {t(item.locationKey)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlatformPreview() {
  const t = useTranslations('landing');
  const [activeModule, setActiveModule] = useState('dashboard');

  const previewComponents: Record<string, (props: { t: (key: string) => string }) => React.ReactElement> = {
    dashboard: DashboardPreview,
    cases: CasesPreview,
    events: EventsPreview,
    academy: AcademyPreview,
    documents: DocumentsPreview,
    community: CommunityPreview,
  };

  const PreviewComponent = previewComponents[activeModule];

  return (
    <section id="platform" className="py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-4">
            {t('platformLabel')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">
            {t('platformTitle')}
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            {t('platformSubtitle')}
          </p>
        </div>

        {/* Interactive Preview */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glow Effect - hidden on mobile for performance */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--accent)]/20 to-[var(--primary)]/20 rounded-3xl blur-2xl opacity-50 hidden sm:block" />

          <div className="relative flex flex-col gap-6">
            {/* Feature Description Panel - Shows on top for mobile */}
            <div className="lg:hidden">
              <div className="p-4 sm:p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg">
                <div className="flex items-start gap-4">
                  {/* Module Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                    {modules.find(m => m.id === activeModule)?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Module Name */}
                    <h4 className="text-lg font-bold text-[var(--text)] mb-1">
                      {t(`modules.${activeModule}`)}
                    </h4>
                    {/* Module Description */}
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {t(`moduleDescriptions.${activeModule}`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Browser Window */}
              <div className="flex-1 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl sm:shadow-2xl overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-[var(--background)] border-b border-[var(--border)]">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="px-2 sm:px-4 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[10px] sm:text-xs text-[var(--text-muted)] max-w-[200px] sm:max-w-xs w-full text-center truncate">
                      arca-hub.com/{activeModule === 'dashboard' ? '' : activeModule}
                    </div>
                  </div>
                  <div className="w-8 sm:w-16" />
                </div>

                {/* Mobile Module Selector - horizontal scroll tabs */}
                <div className="sm:hidden border-b border-[var(--border)] bg-[var(--card)] p-2 overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {modules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => setActiveModule(module.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          activeModule === module.id
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--background)]'
                        }`}
                      >
                        <span className="w-4 h-4">{module.icon}</span>
                        <span>{t(`modules.${module.id}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* App Content */}
                <div className="flex min-h-[300px] sm:min-h-[400px]">
                  {/* Sidebar - Module Selector (hidden on mobile) */}
                  <div className="w-44 lg:w-48 bg-[var(--card)] border-r border-[var(--border)] p-2 sm:p-3 hidden sm:block">
                    <div className="space-y-1">
                      {modules.map((module) => (
                        <button
                          key={module.id}
                          onClick={() => setActiveModule(module.id)}
                          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-left transition-all ${
                            activeModule === module.id
                              ? 'bg-[var(--primary)] text-white'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--background)]'
                          }`}
                        >
                          {module.icon}
                          <span className="text-xs sm:text-sm font-medium">{t(`modules.${module.id}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-3 sm:p-4 lg:p-6 bg-[var(--background)]">
                    {/* Module Header */}
                    <div className="mb-3 sm:mb-4 hidden sm:block">
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--text)]">
                        {t(`modules.${activeModule}`)}
                      </h3>
                    </div>

                    {/* Dynamic Preview Content */}
                    <div className="bg-[var(--card)] rounded-lg sm:rounded-xl border border-[var(--border)] p-3 sm:p-4">
                      <PreviewComponent t={t} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Description Panel - Desktop only (side panel) */}
              <div className="hidden lg:block lg:w-72 flex-shrink-0">
                <div className="lg:sticky lg:top-24 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg">
                  {/* Module Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4">
                    {modules.find(m => m.id === activeModule)?.icon}
                  </div>

                  {/* Module Name */}
                  <h4 className="text-xl font-bold text-[var(--text)] mb-2">
                    {t(`modules.${activeModule}`)}
                  </h4>

                  {/* Module Description */}
                  <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
                    {t(`moduleDescriptions.${activeModule}`)}
                  </p>

                  {/* Feature Highlights */}
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {t(`moduleHighlights.${activeModule}.point${i}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Click hint */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          {t('clickToExplore')}
        </p>
      </div>
    </section>
  );
}
