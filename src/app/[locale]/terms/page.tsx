'use client';

import { useTranslations } from 'next-intl';
import { PublicPageHeader, LandingFooter } from '@/components/landing';

export default function TermsPage() {
  const t = useTranslations('terms');

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

            {/* Acceptance */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('acceptance.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('acceptance.description')}
              </p>
            </section>

            {/* Eligibility */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('eligibility.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('eligibility.description')}
              </p>
            </section>

            {/* Account */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('account.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed mb-4">
                {t('account.description')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>{t('account.item1')}</li>
                <li>{t('account.item2')}</li>
                <li>{t('account.item3')}</li>
              </ul>
            </section>

            {/* Acceptable Use */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('acceptableUse.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed mb-4">
                {t('acceptableUse.description')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--text-muted)]">
                <li>{t('acceptableUse.item1')}</li>
                <li>{t('acceptableUse.item2')}</li>
                <li>{t('acceptableUse.item3')}</li>
                <li>{t('acceptableUse.item4')}</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('intellectualProperty.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('intellectualProperty.description')}
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('liability.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('liability.description')}
              </p>
            </section>

            {/* Termination */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('termination.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('termination.description')}
              </p>
            </section>

            {/* Changes */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('changes.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('changes.description')}
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text)] mb-4">
                {t('governingLaw.title')}
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                {t('governingLaw.description')}
              </p>
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
                <a href="mailto:legal@harlock.it" className="text-[var(--primary)] hover:underline">
                  legal@harlock.it
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
