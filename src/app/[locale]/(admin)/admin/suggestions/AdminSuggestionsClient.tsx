'use client';

import { useState, useTransition } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { updateSuggestionStatus, type Suggestion, type SuggestionStatus } from '@/lib/data/suggestions';
import { useRouter } from '@/navigation';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  reviewed: { label: 'Reviewed', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface AdminSuggestionsClientProps {
  suggestions: Suggestion[];
  total: number;
}

export default function AdminSuggestionsClient({ suggestions, total }: AdminSuggestionsClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState<SuggestionStatus>('reviewed');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openDetail(s: Suggestion) {
    setSelected(s);
    setReply(s.admin_reply || '');
    setStatus(s.status);
    setError(null);
  }

  function handleSave() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await updateSuggestionStatus(selected.id, status, reply || undefined);
      if (result.success) {
        setSelected(null);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update');
      }
    });
  }

  const authorName = (s: Suggestion) => {
    if (!s.author) return 'Unknown';
    const name = `${s.author.contact_first_name || ''} ${s.author.contact_last_name || ''}`.trim();
    return name || s.author.company_name || s.author.email;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Suggestions</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{total} total suggestions</p>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-[var(--text-muted)]">No suggestions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => {
            const config = statusConfig[s.status] || { label: s.status, variant: 'info' as const };
            return (
              <Card key={s.id} className="cursor-pointer hover:border-[var(--primary)] transition-colors" onClick={() => openDetail(s)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text)] truncate">{s.subject}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">{authorName(s)}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{s.content}</p>
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

      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={selected.subject}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setSelected(null)} disabled={isPending}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={isPending}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">From</p>
              <p className="text-sm text-[var(--text)]">{authorName(selected)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Message</p>
              <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{selected.content}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5 block">Status</label>
              <div className="flex gap-2">
                {(['pending', 'reviewed', 'resolved'] as SuggestionStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      status === s
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--card-hover)] text-[var(--text)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {statusConfig[s]?.label || s}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Reply (optional)"
              placeholder="Write a reply to the partner..."
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={4}
            />
            {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
