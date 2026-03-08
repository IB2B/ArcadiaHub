'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { updateComment, deleteComment, type Comment } from '@/lib/data/comments';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onUpdated: () => void;
}

function parseContent(content: string): React.ReactNode[] {
  // Replace @[userId:Name] tokens with highlighted chips
  const parts = content.split(/(@\[[^\]]+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^@\[([^:]+):([^\]]+)\]$/);
    if (match) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary)] text-xs font-medium"
        >
          @{match[2]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommentItem({ comment, currentUserId, onUpdated }: CommentItemProps) {
  const t = useTranslations('comments');
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isOwner = currentUserId === comment.author_id;
  const isDeleted = comment.content === '[deleted]';

  const authorName = comment.author
    ? comment.author.company_name ||
      `${comment.author.contact_first_name ?? ''} ${comment.author.contact_last_name ?? ''}`.trim() ||
      'User'
    : 'User';

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === comment.content) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await updateComment(comment.id, trimmed);
      if (result.success) {
        setEditing(false);
        onUpdated();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteComment(comment.id);
      setDeleteOpen(false);
      onUpdated();
    });
  };

  return (
    <div className="flex gap-3">
      <Avatar
        size="sm"
        name={authorName}
        src={comment.author?.logo_url ?? undefined}
        className="shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-[var(--text)]">{authorName}</span>
          <span className="text-xs text-[var(--text-muted)]">{relativeTime(comment.created_at)}</span>
          {comment.is_edited && !isDeleted && (
            <span className="text-xs text-[var(--text-muted)] italic">({t('edited')})</span>
          )}
        </div>

        {isDeleted ? (
          <p className="text-sm text-[var(--text-muted)] italic">{t('deleted')}</p>
        ) : editing ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              disabled={isPending}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleSaveEdit} isLoading={isPending}>
                {t('save')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); setEditValue(comment.content); }} disabled={isPending}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text)] whitespace-pre-wrap break-words">
            {parseContent(comment.content)}
          </p>
        )}

        {!isDeleted && !editing && isOwner && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              {t('edit')}
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors"
            >
              {t('delete')}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('confirmDelete')}
        message={t('deleteWarning')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}
