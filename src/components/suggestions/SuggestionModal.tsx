'use client';

import { useState, useTransition } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { submitSuggestion } from '@/lib/data/suggestions';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuggestionModal({ isOpen, onClose }: SuggestionModalProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setSubject('');
    setContent('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await submitSuggestion({ subject, content });
      if (result.success) {
        setSuccess(true);
        setTimeout(handleClose, 1500);
      } else {
        setError(result.error || 'Failed to submit suggestion');
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Feedback"
      description="Share a suggestion or idea to help us improve the platform."
      size="md"
    >
      {success ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium text-[var(--text)]">Suggestion submitted!</p>
          <p className="text-sm text-[var(--text-muted)]">Thank you for your feedback. We&apos;ll review it soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject"
            placeholder="Brief description of your suggestion"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            maxLength={200}
          />
          <Textarea
            label="Details"
            placeholder="Describe your suggestion in detail..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={5}
            maxLength={2000}
          />
          {error && (
            <p className="text-sm text-[var(--error)]">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              Submit Feedback
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3 py-2.5 rounded-full bg-[var(--primary)] text-white shadow-lg hover:bg-[var(--primary-hover)] transition-all text-sm font-medium"
        aria-label="Send feedback"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="hidden sm:inline">Feedback</span>
      </button>
      <SuggestionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
