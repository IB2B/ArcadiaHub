'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';

const icons = {
  palette: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  external: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
};

const themes = [
  {
    id: 'c1',
    preview: {
      bg: '#F8FAFC',
      primary: '#244675',
      card: '#FFFFFF',
      sidebar: '#FFFFFF',
    },
  },
  {
    id: 'c2',
    preview: {
      bg: '#F1F5F9',
      primary: '#244675',
      card: '#FFFFFF',
      sidebar: '#0F172A',
    },
  },
  {
    id: 'c3',
    preview: {
      bg: 'linear-gradient(135deg, #f0f4f9 0%, #dce5f0 50%, #f0edf5 100%)',
      primary: '#244675',
      card: 'rgba(255, 255, 255, 0.9)',
      sidebar: 'rgba(255, 255, 255, 0.8)',
    },
  },
];

export default function SettingsPageClient() {
  const t = useTranslations('settings');
  const [currentTheme, setCurrentTheme] = useState('c1');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'c1';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t('subtitle')}
        </p>
      </div>

      {/* Theme Selection */}
      <Card padding="none">
        <CardHeader
          title={t('appearance')}
          subtitle={t('appearanceSubtitle')}
          className="p-4 border-b border-[var(--border)]"
          action={<div className="text-[var(--primary)]">{icons.palette}</div>}
        />
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                  currentTheme === theme.id
                    ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                    : 'border-[var(--border)] hover:border-[var(--primary)]'
                }`}
              >
                {/* Preview */}
                <div
                  className="h-20 rounded-lg mb-3 overflow-hidden border border-[var(--border)]"
                  style={{ background: theme.preview.bg }}
                >
                  <div className="flex h-full">
                    <div
                      className="w-1/4 h-full"
                      style={{ background: theme.preview.sidebar }}
                    />
                    <div className="flex-1 p-2">
                      <div
                        className="h-2 w-1/2 rounded"
                        style={{ background: theme.preview.primary }}
                      />
                      <div
                        className="h-6 mt-2 rounded"
                        style={{ background: theme.preview.card }}
                      />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-medium text-[var(--text)]">
                  {t(`themes.${theme.id}` as 'themes.c1' | 'themes.c2' | 'themes.c3')}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {t(`themes.${theme.id}Desc` as 'themes.c1Desc' | 'themes.c2Desc' | 'themes.c3Desc')}
                </p>

                {/* Selected indicator */}
                {currentTheme === theme.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                    {icons.check}
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card padding="none">
        <CardHeader
          title={t('account')}
          subtitle={t('accountSubtitle')}
          className="p-4 border-b border-[var(--border)]"
          action={<div className="text-[var(--primary)]">{icons.user}</div>}
        />
        <CardContent className="p-0">
          <Link
            href="/profile"
            className="flex items-center justify-between p-4 hover:bg-[var(--card-hover)] transition-colors border-b border-[var(--border)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--card-hover)] text-[var(--text-muted)]">
                {icons.user}
              </div>
              <div>
                <p className="font-medium text-[var(--text)]">{t('profileSettings')}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {t('profileSettingsDesc')}
                </p>
              </div>
            </div>
            <div className="text-[var(--text-muted)]">{icons.external}</div>
          </Link>

          <div className="flex items-center justify-between p-4 hover:bg-[var(--card-hover)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--card-hover)] text-[var(--text-muted)]">
                {icons.bell}
              </div>
              <div>
                <p className="font-medium text-[var(--text)]">{t('notificationSettings')}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {t('notificationSettingsDesc')}
                </p>
              </div>
            </div>
            <div className="text-[var(--text-muted)]">{icons.external}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
