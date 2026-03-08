'use client';

import { useState, useTransition, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { adminDeleteComment, getComments, type Comment } from '@/lib/data/comments';

interface AdminCommentsListProps {
  entityType: string;
  entityId: string;
  initialComments: Comment[];
  initialTotal: number;
}

function parseContent(content: string): React.ReactNode[] {
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

export default function AdminCommentsList({ entityType, entityId, initialComments, initialTotal }: AdminCommentsListProps) {
  const t = useTranslations('comments');
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    startTransition(async () => {
      const result = await getComments(entityType, entityId, nextPage);
      setComments((prev) => [...prev, ...result.comments]);
      setTotal(result.total);
      setPage(nextPage);
    });
  }, [entityType, entityId, page]);

  const handleDelete = useCallback((id: string) => {
    setConfirmDeleteId(id);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmDeleteId) return;
    const idToDelete = confirmDeleteId;
    setConfirmDeleteId(null);
    startTransition(async () => {
      const result = await adminDeleteComment(idToDelete);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== idToDelete));
        setTotal((prev) => prev - 1);
      }
    });
  }, [confirmDeleteId]);

  if (comments.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-4">{t('noComments')}</p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">{total} comment{total !== 1 ? 's' : ''}</p>

      <div className="divide-y divide-[var(--border)]">
        {comments.map((comment) => {
          const authorName = comment.author
            ? `${comment.author.contact_first_name ?? ''} ${comment.author.contact_last_name ?? ''}`.trim() ||
              comment.author.company_name ||
              'User'
            : 'Unknown';

          return (
            <div key={comment.id} className="py-3 flex items-start gap-3">
              <Avatar size="sm" name={authorName} src={comment.author?.logo_url ?? undefined} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[var(--text)]">{authorName}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                  {comment.is_edited && (
                    <span className="text-xs text-[var(--text-muted)] italic">{t('edited')}</span>
                  )}
                </div>
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap break-words">
                  {parseContent(comment.content)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(comment.id)}
                disabled={isPending}
                className="text-[var(--error)] hover:text-[var(--error)] flex-shrink-0"
              >
                {t('delete')}
              </Button>
            </div>
          );
        })}
      </div>

      {comments.length < total && (
        <Button variant="outline" size="sm" onClick={loadMore} disabled={isPending}>
          {t('loadMore')}
        </Button>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title={t('confirmDelete')}
        message={t('deleteWarning')}
        confirmText={t('delete')}
        variant="danger"
      />
    </div>
  );
}
