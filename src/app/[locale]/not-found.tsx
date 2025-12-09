'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-[var(--primary)] rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-60 sm:w-80 h-60 sm:h-80 bg-[var(--accent)] rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* 404 Number */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-[120px] sm:text-[160px] lg:text-[200px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mb-3 sm:mb-4">
          {t('title')}
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base lg:text-lg text-[var(--text-muted)] mb-8 sm:mb-10 leading-relaxed px-4">
          {t('description')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {t('goHome')}
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl border-2 border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('goBack')}
          </button>
        </div>

        {/* Help Link */}
        <p className="mt-8 sm:mt-10 text-xs sm:text-sm text-[var(--text-muted)]">
          {t('needHelp')}{' '}
          <Link href="/contact" className="text-[var(--primary)] hover:underline font-medium">
            {t('contactSupport')}
          </Link>
        </p>
      </div>
    </div>
  );
}
