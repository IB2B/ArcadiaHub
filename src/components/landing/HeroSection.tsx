'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  const t = useTranslations('landing');
  const tNav = useTranslations('nav');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-24">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs - Static, no animation */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--primary)] rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[var(--accent)] rounded-full opacity-10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary-light)] rounded-full opacity-20 blur-3xl" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
        {/* Main content grid - side by side on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Text Content */}
          <div className="text-center lg:text-left order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
              </span>
              {t('partnerOnly')}
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--text)] mb-4 sm:mb-6 leading-tight">
              {t('heroTitle')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
                {t('heroHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--text-muted)] mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4">
              <Link
                href={isLoggedIn ? '/dashboard' : '/login'}
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {isLoggedIn ? tNav('dashboard') : t('accessPortal')}
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              {!isLoggedIn && (
                <Link
                  href="/request-access"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl border-2 border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
                >
                  {t('requestAccess')}
                </Link>
              )}
            </div>
          </div>

          {/* Right - Laptop Mockup */}
          <div className="relative order-2 mt-8 lg:mt-0">
            {/* Glow effect behind laptop */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--accent)]/10 to-[var(--primary)]/20 rounded-3xl blur-2xl opacity-60 hidden sm:block" />

            {/* Laptop Frame */}
            <div className="relative">
              {/* Screen bezel */}
              <div className="relative bg-gray-800 rounded-t-xl sm:rounded-t-2xl p-[6px] sm:p-2 shadow-2xl">
                {/* Camera notch */}
                <div className="absolute top-[2px] sm:top-1 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-900 flex items-center justify-center">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-700" />
                </div>

                {/* Screen with 16:10 aspect ratio */}
                <div className="relative bg-[var(--card)] rounded-lg overflow-hidden" style={{ aspectRatio: '16/10' }}>
                  {/* Browser Chrome */}
                  <div className="bg-gray-800 px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="bg-gray-700 rounded px-2 py-0.5 text-[8px] sm:text-[10px] text-gray-400 text-center max-w-[140px] sm:max-w-[180px] mx-auto truncate">
                        arca-hub.com/dashboard
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="bg-[var(--background)] p-2 sm:p-3 lg:p-4 h-full">
                    <div className="flex gap-2 sm:gap-3 h-full">
                      {/* Sidebar */}
                      <div className="hidden sm:block w-20 lg:w-24 flex-shrink-0">
                        <div className="space-y-1">
                          {/* Logo area */}
                          <div className="flex items-center gap-1.5 px-1.5 py-1.5 mb-2">
                            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded bg-[var(--primary)] flex items-center justify-center">
                              <img src="/harlock-favicon.png" alt="" className="w-3 h-3 lg:w-4 lg:h-4" />
                            </div>
                            <span className="text-[7px] lg:text-[8px] font-semibold text-[var(--text)]">Arcadia</span>
                          </div>
                          {/* Nav items */}
                          {['Dashboard', 'Cases', 'Events', 'Academy', 'Documents', 'Community'].map((item, i) => (
                            <div
                              key={item}
                              className={`px-1.5 py-1 lg:py-1.5 rounded text-[7px] lg:text-[8px] font-medium truncate ${i === 0 ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)]'}`}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        {/* Welcome Header */}
                        <div className="mb-2 lg:mb-3">
                          <div className="h-3 sm:h-4 lg:h-5 w-24 sm:w-32 lg:w-40 bg-[var(--text)]/10 rounded mb-1" />
                          <div className="h-2 lg:h-2.5 w-32 sm:w-40 lg:w-48 bg-[var(--text-muted)]/10 rounded" />
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-1.5 lg:gap-2 mb-2 lg:mb-3">
                          {[
                            { value: '12', label: 'Active', color: 'var(--primary)' },
                            { value: '3', label: 'Pending', color: '#f59e0b' },
                            { value: '28', label: 'Total', color: '#10b981' },
                            { value: '5', label: 'Events', color: '#8b5cf6' },
                          ].map((stat, i) => (
                            <div key={i} className="bg-[var(--card)] rounded p-1.5 lg:p-2 border border-[var(--border)]">
                              <div className="text-[10px] sm:text-xs lg:text-sm font-bold" style={{ color: stat.color }}>{stat.value}</div>
                              <div className="text-[6px] sm:text-[7px] lg:text-[8px] text-[var(--text-muted)] mt-0.5">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-2 gap-1.5 lg:gap-2 flex-1">
                          {/* Recent Cases */}
                          <div className="bg-[var(--card)] rounded p-1.5 lg:p-2 border border-[var(--border)]">
                            <div className="text-[7px] sm:text-[8px] lg:text-[9px] font-semibold text-[var(--text)] mb-1 lg:mb-1.5">Recent Cases</div>
                            <div className="space-y-1 lg:space-y-1.5">
                              {[
                                { code: 'PRT-001', status: 'In Progress', color: 'bg-blue-500' },
                                { code: 'PRT-002', status: 'Completed', color: 'bg-green-500' },
                                { code: 'PRT-003', status: 'Pending', color: 'bg-amber-500' },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <div className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${item.color}`} />
                                    <span className="text-[6px] sm:text-[7px] lg:text-[8px] text-[var(--primary)] font-medium">{item.code}</span>
                                  </div>
                                  <span className="text-[5px] sm:text-[6px] lg:text-[7px] text-[var(--text-muted)]">{item.status}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Upcoming Events */}
                          <div className="bg-[var(--card)] rounded p-1.5 lg:p-2 border border-[var(--border)]">
                            <div className="text-[7px] sm:text-[8px] lg:text-[9px] font-semibold text-[var(--text)] mb-1 lg:mb-1.5">Upcoming Events</div>
                            <div className="space-y-1 lg:space-y-1.5">
                              {[
                                { title: 'Workshop Q1', date: 'Jan 15' },
                                { title: 'Webinar', date: 'Jan 22' },
                                { title: 'Meeting', date: 'Jan 28' },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-[var(--primary)]/10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-sm bg-[var(--primary)]/30" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[6px] sm:text-[7px] lg:text-[8px] text-[var(--text)] truncate">{item.title}</div>
                                    <div className="text-[5px] sm:text-[6px] lg:text-[7px] text-[var(--text-muted)]">{item.date}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Academy Progress */}
                          <div className="bg-[var(--card)] rounded p-1.5 lg:p-2 border border-[var(--border)]">
                            <div className="text-[7px] sm:text-[8px] lg:text-[9px] font-semibold text-[var(--text)] mb-1 lg:mb-1.5">Academy</div>
                            <div className="space-y-1 lg:space-y-1.5">
                              {[
                                { title: 'Solar Basics', progress: 80 },
                                { title: 'Sales Training', progress: 45 },
                              ].map((item, i) => (
                                <div key={i}>
                                  <div className="flex justify-between mb-0.5">
                                    <span className="text-[6px] sm:text-[7px] lg:text-[8px] text-[var(--text)]">{item.title}</span>
                                    <span className="text-[5px] sm:text-[6px] lg:text-[7px] text-[var(--text-muted)]">{item.progress}%</span>
                                  </div>
                                  <div className="h-1 lg:h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${item.progress}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="bg-[var(--card)] rounded p-1.5 lg:p-2 border border-[var(--border)]">
                            <div className="text-[7px] sm:text-[8px] lg:text-[9px] font-semibold text-[var(--text)] mb-1 lg:mb-1.5">Documents</div>
                            <div className="space-y-1 lg:space-y-1.5">
                              {[
                                { name: 'Contract 2024.pdf', size: '2.4 MB' },
                                { name: 'Brand Kit.zip', size: '8.1 MB' },
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-red-500/10 flex items-center justify-center">
                                    <div className="w-1.5 h-2 lg:w-2 lg:h-2.5 rounded-sm bg-red-500/30" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[6px] sm:text-[7px] lg:text-[8px] text-[var(--text)] truncate">{item.name}</div>
                                    <div className="text-[5px] sm:text-[6px] lg:text-[7px] text-[var(--text-muted)]">{item.size}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Base/Hinge */}
              <div className="relative">
                {/* Hinge */}
                <div className="h-2 sm:h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-sm mx-auto" style={{ width: '90%' }} />
                {/* Base */}
                <div className="h-1.5 sm:h-2 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-xl mx-auto shadow-lg" style={{ width: '100%' }}>
                  {/* Trackpad area hint */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-0.5 sm:h-1 bg-gray-700/50 rounded-t-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - at the bottom of the section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 flex justify-center">
          <button
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            <span className="text-xs font-medium">{t('scrollToExplore')}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
