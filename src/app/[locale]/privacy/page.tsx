'use client';

import { useTranslations } from 'next-intl';
import { PublicPageHeader, LandingFooter } from '@/components/landing';

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <PublicPageHeader />

      <main className="flex-1 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] mb-4">
              {t('title')}
            </h1>
            <p className="text-[var(--text-muted)]">
              {t('lastUpdated')}: {t('lastUpdatedDate')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-10">
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('introduction')}
              </p>
            </section>

            {/* Data Collection */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('dataCollection.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed mb-4">
                {t('dataCollection.description')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>{t('dataCollection.item1')}</li>
                <li>{t('dataCollection.item2')}</li>
                <li>{t('dataCollection.item3')}</li>
                <li>{t('dataCollection.item4')}</li>
              </ul>
            </section>

            {/* Data Usage */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('dataUsage.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed mb-4">
                {t('dataUsage.description')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>{t('dataUsage.item1')}</li>
                <li>{t('dataUsage.item2')}</li>
                <li>{t('dataUsage.item3')}</li>
                <li>{t('dataUsage.item4')}</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('dataProtection.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('dataProtection.description')}
              </p>
            </section>

            {/* Cookies */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('cookies.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('cookies.description')}
              </p>
            </section>

            {/* Third Parties */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('thirdParties.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('thirdParties.description')}
              </p>
            </section>

            {/* User Rights */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('userRights.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed mb-4">
                {t('userRights.description')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>{t('userRights.item1')}</li>
                <li>{t('userRights.item2')}</li>
                <li>{t('userRights.item3')}</li>
                <li>{t('userRights.item4')}</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('contact.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('contact.description')}
              </p>
              <p className="text-[var(--text-muted)] mt-4">
                <strong className="text-[var(--text)]">Email:</strong>{' '}
                <a href="mailto:info@harlock.it" className="text-[var(--primary)] hover:underline">
                  info@harlock.it
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
