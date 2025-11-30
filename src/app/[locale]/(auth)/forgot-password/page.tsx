'use client';

import { useState, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { forgotPassword } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent } from '@/components/ui/Card';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = useCallback(async (formData: FormData) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (!result.success && result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">{tCommon('appName')}</h1>
          </Link>
          <p className="mt-2 text-[var(--text-muted)]">
            {t('forgotPasswordSubtitle')}
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent>
            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  {t('checkYourEmail')}
                </h3>
                <p className="text-[var(--text-muted)] mb-4">
                  {t('resetLinkSent')}
                </p>
                <Link href="/login">
                  <Button variant="outline" fullWidth>
                    {t('backToLogin')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm">
                    {error}
                  </div>
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

                <Button type="submit" fullWidth isLoading={isPending}>
                  {t('sendResetLink')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Back to login */}
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
