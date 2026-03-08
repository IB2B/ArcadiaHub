'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { updateSuggestionStatus, type Suggestion, type SuggestionStatus } from '@/lib/data/suggestions';

const statusVariant: Record<string, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  reviewed: 'info',
  resolved: 'success',
};

interface SuggestionDetailModalProps {
  suggestion: Suggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function SuggestionDetailModal({ suggestion, isOpen, onClose, onUpdated }: SuggestionDetailModalProps) {
  const t = useTranslations('suggestions.admin');
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<SuggestionStatus>(suggestion?.status ?? 'pending');
  const [reply, setReply] = useState(suggestion?.admin_reply ?? '');

  // Sync when suggestion changes
  if (suggestion && suggestion.status !== status && !isPending) {
    setStatus(suggestion.status);
    setReply(suggestion.admin_reply ?? '');
  }

  const handleSave = () => {
    if (!suggestion) return;
    startTransition(async () => {
      await updateSuggestionStatus(suggestion.id, status, reply || undefined);
      onUpdated();
      onClose();
    });
  };

  if (!suggestion) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={suggestion.subject}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isPending}>
            {isPending ? t('saving') : t('save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Partner info */}
        {suggestion.profile && (
          <div className="text-sm text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text)]">
              {suggestion.profile.company_name ?? `${suggestion.profile.contact_first_name} ${suggestion.profile.contact_last_name}`}
            </span>
            {' — '}{suggestion.profile.email}
          </div>
        )}

        {/* Message */}
        <div className="p-4 rounded-lg bg-[var(--card-hover)] border border-[var(--border)]">
          <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{suggestion.message}</p>
        </div>

        <div className="text-xs text-[var(--text-muted)]">
          {new Date(suggestion.created_at).toLocaleString()}
        </div>

        {/* Status */}
        <Select
          label={t('updateStatus')}
          value={status}
          onChange={(e) => setStatus(e.target.value as SuggestionStatus)}
          options={[
            { value: 'pending', label: t('pending') },
            { value: 'reviewed', label: t('reviewed') },
            { value: 'resolved', label: t('resolved') },
          ]}
          disabled={isPending}
        />

        {/* Admin Reply */}
        <Textarea
          label="Admin Reply (optional)"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t('replyPlaceholder')}
          rows={4}
          disabled={isPending}
        />
      </div>
    </Modal>
  );
}
