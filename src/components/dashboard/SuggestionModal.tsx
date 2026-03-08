'use client';

import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { submitSuggestion } from '@/lib/data/suggestions';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestionModal({ isOpen, onClose }: SuggestionModalProps) {
  const t = useTranslations('suggestions');
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitSuggestion(formData);
      if (!result.success) {
        setError(result.error ?? 'Failed to submit');
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('sendFeedback')} size="md">
      {success ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-[var(--text)] font-medium">{t('success')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('subject')}
            name="subject"
            placeholder={t('subjectPlaceholder')}
            required
            disabled={isPending}
          />
          <Textarea
            label={t('message')}
            name="message"
            placeholder={t('messagePlaceholder')}
            rows={5}
            required
            disabled={isPending}
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              {isPending ? t('submitting') : t('submit')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
