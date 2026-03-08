'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/database/client';
import { getComments, createComment, type Comment } from '@/lib/data/comments';
import CommentItem from './CommentItem';
import MentionInput from './MentionInput';
import Button from '@/components/ui/Button';

interface CommentSectionProps {
  entityType: string;
  entityId: string;
}

export default function CommentSection({ entityType, entityId }: CommentSectionProps) {
  const t = useTranslations('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id);
    });
  }, []);

  const loadComments = useCallback(async (p: number = 1) => {
    setLoading(true);
    try {
      const result = await getComments(entityType, entityId, p);
      setComments(result.comments);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const handleSubmit = (content: string, mentions: string[]) => {
    startTransition(async () => {
      const result = await createComment({ entityType, entityId, content, mentions });
      if (result.success) {
        await loadComments(page);
      }
    });
  };

  const handleUpdated = () => {
    loadComments(page);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[var(--text)]">
        {t('title')} {total > 0 && <span className="text-[var(--text-muted)] font-normal text-sm">({total})</span>}
      </h3>

      {/* Comment input */}
      {currentUserId && (
        <MentionInput
          onSubmit={handleSubmit}
          disabled={isPending}
        />
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[var(--border)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[var(--border)] rounded w-1/4" />
                <div className="h-3 bg-[var(--border)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-4 text-center">{t('noComments')}</p>
      ) : (
        <div className="space-y-4 divide-y divide-[var(--border)]">
          {comments.map((comment) => (
            <div key={comment.id} className="pt-4 first:pt-0">
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onUpdated={handleUpdated}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadComments(page < totalPages ? page + 1 : 1)}
            disabled={loading}
          >
            {t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
