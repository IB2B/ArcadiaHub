'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface LandingHeaderProps {
  isLoggedIn: boolean;
  isLoading: boolean;
}

export default function LandingHeader({ isLoggedIn, isLoading }: LandingHeaderProps) {
  const t = useTranslations('landing');
  const tNav = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--card)]/95 backdrop-blur-md shadow-lg border-b border-[var(--border)]'
          : 'bg-transparent'
      }`}
    >
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
            <span className={`font-semibold text-lg hidden sm:block transition-colors ${
              scrolled ? 'text-[var(--text)]' : 'text-[var(--text)]'
            }`}>
              Arcadia Hub
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              {t('navFeatures')}
            </button>
            <button
              onClick={() => document.getElementById('platform')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              {t('navPlatform')}
            </button>
            <button
              onClick={() => document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
              {t('navCommunity')}
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {!isLoading && (
              <Link
                href={isLoggedIn ? '/dashboard' : '/login'}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all shadow-md hover:shadow-lg"
              >
                {isLoggedIn ? tNav('dashboard') : t('signIn')}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
