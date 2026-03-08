import { getTranslations } from 'next-intl/server';
import { getMySuggestions } from '@/lib/data/suggestions';
import Badge from '@/components/ui/Badge';
import Card, { CardContent } from '@/components/ui/Card';

const statusVariant: Record<string, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  reviewed: 'info',
  resolved: 'success',
};

export default async function SuggestionsPage() {
  const t = await getTranslations('suggestions');
  const suggestions = await getMySuggestions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t('subtitle')}</p>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          <p className="font-medium">{t('noSuggestions')}</p>
          <p className="text-sm mt-1">{t('noSuggestionsHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <Card key={s.id} padding="none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] truncate">{s.subject}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{s.message}</p>
                    {s.admin_reply && (
                      <div className="mt-3 p-3 rounded-lg bg-[var(--card-hover)] border border-[var(--border)]">
                        <p className="text-xs font-medium text-[var(--primary)] mb-1">{t('adminReply')}</p>
                        <p className="text-sm text-[var(--text)]">{s.admin_reply}</p>
                      </div>
                    )}
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant[s.status] ?? 'default'} size="sm">
                    {t(`status.${s.status}` as Parameters<typeof t>[0])}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
