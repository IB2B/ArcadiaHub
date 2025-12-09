'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

interface CTASectionProps {
  isLoggedIn: boolean;
}

export default function CTASection({ isLoggedIn }: CTASectionProps) {
  const t = useTranslations('landing');
  const tNav = useTranslations('nav');

  return (
    <section className="relative overflow-hidden">
      {/* Full-width gradient background */}
      <div className="bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--primary)] py-16 sm:py-20 lg:py-24">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full opacity-5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white rounded-full opacity-5 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {t('ctaSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={isLoggedIn ? '/dashboard' : '/login'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl bg-white text-[var(--primary)] hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {isLoggedIn ? tNav('dashboard') : t('ctaButton')}
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            {!isLoggedIn && (
              <Link
                href="/request-access"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 transition-all"
              >
                {t('ctaSecondary')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
