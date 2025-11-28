import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'var(--background)' }}>
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 gradient-text">
          {t('appName')}
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
          Harlock Partner Portal
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg font-medium transition-all border hover:bg-[var(--card-hover)]"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            Partner Login
          </Link>
        </div>

        <div className="mt-6">
          <Link
            href="/demo/ui-picker"
            className="text-sm underline"
            style={{ color: 'var(--text-muted)' }}
          >
            UI Style Picker (Demo)
          </Link>
        </div>
      </div>
    </div>
  );
}
