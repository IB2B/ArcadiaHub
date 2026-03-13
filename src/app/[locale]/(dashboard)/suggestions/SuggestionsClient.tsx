'use client';

import { useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SuggestionModal } from '@/components/suggestions/SuggestionModal';
import type { Suggestion } from '@/lib/data/suggestions';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  reviewed: { label: 'Reviewed', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface SuggestionsClientProps {
  suggestions: Suggestion[];
}

export default function SuggestionsClient({ suggestions }: SuggestionsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">My Suggestions</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Track the status of your submitted feedback.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + New Suggestion
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--card-hover)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="font-medium text-[var(--text)]">No suggestions yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">Have an idea to improve the platform?</p>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => {
            const config = statusConfig[s.status] || { label: s.status, variant: 'info' as const };
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">{s.subject}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{s.content}</p>
                      {s.admin_reply && (
                        <div className="mt-3 p-3 rounded-lg bg-[var(--card-hover)] border border-[var(--border)]">
                          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Admin Reply</p>
                          <p className="text-sm text-[var(--text)]">{s.admin_reply}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(s.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
