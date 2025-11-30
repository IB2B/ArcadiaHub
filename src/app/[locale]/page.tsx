'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { createClient } from '@/lib/database/client';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HomePage() {
  const t = useTranslations('landing');
  const tNav = useTranslations('nav');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="bg-[var(--text)] rounded-lg px-3 py-1.5">
              <img
                src="/logo-harlock.png"
                alt="Harlock"
                className="h-7 w-auto"
              />
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {!isLoading && (
                <Link
                  href={isLoggedIn ? '/dashboard' : '/login'}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-all"
                >
                  {isLoggedIn ? tNav('dashboard') : t('signIn')}
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            {t('partnerOnly')}
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text)] mb-4 leading-tight">
            {t('heroTitle')}
            <span className="text-[var(--primary)]"> {t('heroHighlight')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[var(--text-muted)] mb-8 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* CTA Button */}
          <Link
            href={isLoggedIn ? '/dashboard' : '/login'}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            {isLoggedIn ? tNav('dashboard') : t('accessPortal')}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-[var(--text-muted)]">
              © {new Date().getFullYear()} Harlock. {t('allRightsReserved')}
            </span>
            <a
              href="https://harlock.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
            >
              harlock.it
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
