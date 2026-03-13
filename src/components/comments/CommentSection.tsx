'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { createComment, updateComment, deleteComment, searchUsersForMention, type Comment, type EntityType } from '@/lib/data/comments';
import { useRouter } from '@/navigation';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function authorName(comment: Comment): string {
  if (!comment.author) return 'Unknown';
  const name = `${comment.author.contact_first_name || ''} ${comment.author.contact_last_name || ''}`.trim();
  return name || comment.author.company_name || 'User';
}

/** Highlight @mentions in plain text */
function renderContent(text: string) {
  return text.split(/(@\S+)/g).map((part, i) =>
    /^@\S+$/.test(part)
      ? <span key={i} className="text-[var(--primary)] font-medium">{part}</span>
      : part
  );
}

type MentionUser = { id: string; name: string; company: string | null };

interface MentionDropdownProps {
  results: MentionUser[];
  query: string;
  onSelect: (user: MentionUser) => void;
  onClose: () => void;
}

function MentionDropdown({ results, query, onSelect, onClose }: MentionDropdownProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="absolute z-50 left-0 right-0 bottom-full mb-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
      {results.length === 0 ? (
        <p className="px-3 py-2 text-xs text-[var(--text-muted)]">
          {query.length === 0 ? 'Start typing to search users…' : 'No users found'}
        </p>
      ) : results.map(user => (
        <button
          key={user.id}
          type="button"
          onMouseDown={e => { e.preventDefault(); onSelect(user); }}
          className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--card-hover)] flex items-center gap-2 transition-colors"
        >
          <span className="font-medium text-[var(--text)]">{user.name}</span>
          {user.company && (
            <span className="text-xs text-[var(--text-muted)]">{user.company}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Hook that adds @mention detection to a textarea */
function useMentions(content: string, setContent: (v: string) => void) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionAnchor, setMentionAnchor] = useState(0);
  const [mentionResults, setMentionResults] = useState<MentionUser[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    const cursor = e.target.selectionStart ?? val.length;
    const before = val.slice(0, cursor);
    const match = before.match(/@(\w*)$/);
    if (match) {
      setMentionAnchor(cursor - match[0].length);
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
      setMentionResults([]);
    }
  }

  useEffect(() => {
    if (mentionQuery === null) {
      setMentionResults([]);
      return;
    }
    if (mentionQuery.length === 0) return; // wait for first letter
    const timer = setTimeout(async () => {
      const results = await searchUsersForMention(mentionQuery);
      setMentionResults(results);
    }, 250);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  function selectMention(user: MentionUser) {
    const before = content.slice(0, mentionAnchor);
    const after = content.slice(mentionAnchor + 1 + (mentionQuery?.length ?? 0));
    const token = user.name.split(' ')[0];
    setContent(before + '@' + token + ' ' + after);
    setMentions(prev => prev.includes(user.id) ? prev : [...prev, user.id]);
    setMentionQuery(null);
    setMentionResults([]);
  }

  function closeMentions() {
    setMentionQuery(null);
    setMentionResults([]);
  }

  function resetMentions() {
    setMentions([]);
    setMentionQuery(null);
    setMentionResults([]);
  }

  // Show dropdown as soon as @ is typed (even with empty query to show hint)
  const showDropdown = mentionQuery !== null;

  return { handleChange, selectMention, closeMentions, resetMentions, mentions, showDropdown, mentionResults, mentionQuery };
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  entityType: EntityType;
  entityId: string;
  depth?: number;
}

function CommentItem({ comment, currentUserId, entityType, entityId, depth = 0 }: CommentItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const isOwn = currentUserId === comment.author_id;

  const mention = useMentions(replyContent, setReplyContent);

  function handleEdit() {
    startTransition(async () => {
      const result = await updateComment(comment.id, editContent);
      if (result.success) {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteComment(comment.id);
      router.refresh();
    });
  }

  function handleReply() {
    if (!replyContent.trim()) return;
    startTransition(async () => {
      const result = await createComment({
        content: replyContent,
        entityType,
        entityId,
        parentId: comment.id,
        mentions: mention.mentions,
      });
      if (result.success) {
        setReplyContent('');
        mention.resetMentions();
        setReplying(false);
        router.refresh();
      }
    });
  }

  return (
    <div id={`comment-${comment.id}`} className={`${depth > 0 ? 'ml-8 mt-3' : ''} scroll-mt-24`}>
      <div className="flex gap-3">
        <Avatar
          name={authorName(comment)}
          src={comment.author?.logo_url || undefined}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-[var(--card-hover)] rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-[var(--text)]">{authorName(comment)}</span>
              <span className="text-xs text-[var(--text-muted)]" suppressHydrationWarning>{formatRelativeTime(comment.created_at)}</span>
              {comment.is_edited && (
                <span className="text-xs text-[var(--text-muted)]">(edited)</span>
              )}
            </div>
            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full text-sm bg-[var(--card)] border border-[var(--border)] rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={handleEdit} isLoading={isPending}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{renderContent(comment.content)}</p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 px-1">
            {depth === 0 && (
              <button
                onClick={() => setReplying(!replying)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                Reply
              </button>
            )}
            {isOwn && !editing && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
          {replying && (
            <div className="mt-2 flex gap-2">
              <div className="flex-1 relative">
                {mention.showDropdown && (
                  <MentionDropdown
                    results={mention.mentionResults}
                    query={mention.mentionQuery ?? ''}
                    onSelect={mention.selectMention}
                    onClose={mention.closeMentions}
                  />
                )}
                <textarea
                  ref={replyRef}
                  value={replyContent}
                  onChange={mention.handleChange}
                  placeholder="Write a reply... Type @ to mention someone"
                  className="w-full text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                  rows={2}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="primary" onClick={handleReply} isLoading={isPending}>Reply</Button>
                <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              entityType={entityType}
              entityId={entityId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  comments: Comment[];
  entityType: EntityType;
  entityId: string;
  currentUserId?: string;
}

export default function CommentSection({ comments, entityType, entityId, currentUserId }: CommentSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mention = useMentions(content, setContent);

  function handleSubmit() {
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await createComment({ content, entityType, entityId, mentions: mention.mentions });
      if (result.success) {
        setContent('');
        mention.resetMentions();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[var(--text)]">
        Comments {comments.length > 0 && <span className="text-[var(--text-muted)] font-normal">({comments.length})</span>}
      </h3>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              entityType={entityType}
              entityId={entityId}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">No comments yet. Be the first to comment.</p>
      )}

      {/* New comment input */}
      {currentUserId && (
        <div className="flex gap-3 pt-2">
          <div className="flex-1 relative">
            {mention.showDropdown && (
              <MentionDropdown
                results={mention.mentionResults}
                query={mention.mentionQuery ?? ''}
                onSelect={u => { mention.selectMention(u); textareaRef.current?.focus(); }}
                onClose={mention.closeMentions}
              />
            )}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={mention.handleChange}
              placeholder="Write a comment... Type @ to mention someone"
              className="w-full text-sm bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              rows={3}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-xs text-[var(--text-muted)]">Ctrl+Enter to submit · @ to mention</span>
              <Button size="sm" variant="primary" onClick={handleSubmit} isLoading={isPending} disabled={!content.trim()}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
