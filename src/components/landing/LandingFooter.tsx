'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function LandingFooter() {
  const t = useTranslations('landing');

  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[var(--text)] rounded-lg px-3 py-1.5">
                <img
                  src="/logo-harlock.png"
                  alt="Harlock"
                  className="h-6 w-auto"
                />
              </div>
              <span className="font-semibold text-lg text-[var(--text)]">
                Arcadia Hub
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-sm max-w-sm mb-6">
              {t('footerDescription')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/harlock-srl/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@harlocksrl"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61565692693254"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform Links - anchor scrolls */}
          <div>
            <h4 className="font-semibold text-[var(--text)] mb-4">{t('footerPlatform')}</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/#features"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.cases')}
                </a>
              </li>
              <li>
                <a
                  href="/#features"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.events')}
                </a>
              </li>
              <li>
                <a
                  href="/#features"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.academy')}
                </a>
              </li>
              <li>
                <a
                  href="/#features"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.documents')}
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-[var(--text)] mb-4">{t('footerCompany')}</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://harlock.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.about')}
                </a>
              </li>
              <li>
                <a
                  href="https://harlock.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.contact')}
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                >
                  {t('footerLinks.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Info */}
          <div>
            <h4 className="font-semibold text-[var(--text)] mb-4">Harlock S.r.l.</h4>
            <div className="space-y-2 text-sm text-[var(--text-muted)]">
              <p>P.IVA: 13277270966</p>
              <p>Viale Majno 9</p>
              <p>20122 Milano (MI)</p>
              <p>Italia</p>
              <div className="pt-2 space-y-1">
                <p>
                  <a href="tel:+3902873645" className="hover:text-[var(--primary)] transition-colors">
                    +39 02 873 645
                  </a>
                </p>
                <p>
                  <a href="mailto:info@harlock.it" className="hover:text-[var(--primary)] transition-colors">
                    info@harlock.it
                  </a>
                </p>
              </div>
              <a
                href="https://harlock.it"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-[var(--primary)] hover:underline font-medium"
              >
                harlock.it
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} Harlock S.r.l. {t('allRightsReserved')}
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
  );
}
