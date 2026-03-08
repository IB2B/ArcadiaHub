import { getTranslations } from 'next-intl/server';
import { getSubUsers } from '@/lib/data/admin';
import { getCurrentUserProfile } from '@/lib/data/profiles';
import TeamClient from './TeamClient';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function TeamPage({ params: _params, searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? '1', 10);
  const search = sp.search ?? '';

  const [t, profile, result] = await Promise.all([
    getTranslations('admin.team'),
    getCurrentUserProfile(),
    getSubUsers({ page, pageSize: 20, search }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t('subtitle')}</p>
      </div>

      <TeamClient
        partners={result.data}
        total={result.count}
        totalPages={result.totalPages}
        currentPage={page}
        initialSearch={search}
        currentUserRole={(profile?.role as 'ADMIN' | 'COMMERCIAL') ?? 'COMMERCIAL'}
        currentUserId={profile?.id ?? ''}
      />
    </div>
  );
}
