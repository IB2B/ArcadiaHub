'use client';

import { useState, useCallback, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { login } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const handleSubmit = useCallback(async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await login(formData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">{tCommon('appName')}</h1>
          </Link>
          <p className="mt-2 text-[var(--text-muted)]">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardContent>
            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm">
                  {error}
                </div>
              )}

              {redirectTo && (
                <input type="hidden" name="redirectTo" value={redirectTo} />
              )}

              <Input
                label={t('email')}
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                autoComplete="email"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
              />

              <Input
                label={t('password')}
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                }
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-muted)]">{t('rememberMe')}</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button type="submit" fullWidth isLoading={isPending}>
                {t('signIn')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          {t('noAccount')}{' '}
          <Link href="/register" className="text-[var(--primary)] hover:underline font-medium">
            {t('contactUs')}
          </Link>
        </p>
      </div>
    </div>
  );
}
