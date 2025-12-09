'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function PublicPageHeader() {
  const t = useTranslations('landing');

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-[var(--text)] rounded-lg px-3 py-1.5 group-hover:scale-105 transition-transform">
              <img
                src="/logo-harlock.png"
                alt="Harlock"
                className="h-7 w-auto"
              />
            </div>
            <span className="font-semibold text-lg hidden sm:block text-[var(--text)]">
              Arcadia Hub
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all shadow-md hover:shadow-lg"
            >
              {t('signIn')}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
