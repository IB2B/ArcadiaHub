import { getTranslations } from 'next-intl/server';
import { getAllSuggestions } from '@/lib/data/suggestions';
import SuggestionsClient from './SuggestionsClient';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminSuggestionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('suggestions.admin');

  const status = (params.status as 'pending' | 'reviewed' | 'resolved' | 'all') || 'all';
  const search = params.search || '';
  const page = parseInt(params.page || '1', 10);

  const { suggestions, total, totalPages } = await getAllSuggestions({ status, search, page });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t('subtitle')}</p>
      </div>

      <SuggestionsClient
        initialSuggestions={suggestions}
        total={total}
        totalPages={totalPages}
        initialStatus={status}
        initialSearch={search}
        initialPage={page}
      />
    </div>
  );
}
