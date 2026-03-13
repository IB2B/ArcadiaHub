'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import { validatePasswordReset, activateProfile } from '@/lib/auth';
import { createClient } from '@/lib/database/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardContent } from '@/components/ui/Card';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasToken, setHasToken] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasToken(false);
      return;
    }

    // Parse tokens directly from the URL hash and set the session manually.
    // onAuthStateChange can miss the PASSWORD_RECOVERY event if it fires
    // before the listener is registered, so we set the session explicitly.
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasToken(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setHasToken(false);
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSessionReady(true);
          // Clean the tokens from the URL to prevent reuse
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate fields
    const validation = await validatePasswordReset(password, confirmPassword);
    if (!validation.success) {
      setError(validation.error || null);
      return;
    }

    startTransition(async () => {
      // Use the browser client — it holds the partner's recovery session
      // established from the URL hash token, not the admin's cookie session
      const supabase = createClient();
      const { data, error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Activate the profile via server action (safe — user ID comes from the
      // just-updated browser session, not from cookies)
      if (data.user) {
        await activateProfile(data.user.id);
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    });
  };

  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] relative">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                {t('invalidResetLink')}
              </h3>
              <p className="text-[var(--text-muted)] mb-4">
                {t('invalidResetLinkDescription')}
              </p>
              <Link href="/forgot-password">
                <Button fullWidth>{t('requestNewLink')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">{tCommon('appName')}</h1>
          </Link>
          <p className="mt-2 text-[var(--text-muted)]">
            {t('resetPasswordSubtitle')}
          </p>
        </div>

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
                  {t('passwordResetSuccess')}
                </h3>
                <p className="text-[var(--text-muted)] mb-4">
                  {t('redirectingToLogin')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label={t('newPassword')}
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  hint={t('passwordHint')}
                  disabled={!sessionReady}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  }
                />

                <Input
                  label={t('confirmPassword')}
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={!sessionReady}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  }
                />

                <Button type="submit" fullWidth isLoading={isPending} disabled={!sessionReady}>
                  {t('resetPassword')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
