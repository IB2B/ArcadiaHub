'use client';

import { useTranslations } from 'next-intl';
import Card, { CardContent } from '@/components/ui/Card';
import { Database } from '@/types/database.types';
import CommentSection from '@/components/comments/CommentSection';
import type { Comment } from '@/lib/data/comments';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

interface BlogPostClientProps {
  post: BlogPost;
  comments?: Comment[];
  currentUserId?: string;
}

const icons = {
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  tag: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  share: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  ),
};

export default function BlogPostClient({ post, comments = [], currentUserId }: BlogPostClientProps) {
  const t = useTranslations('blog');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Article Card */}
      <Card>
        {/* Featured Image */}
        {post.featured_image && (
          <div className="aspect-video w-full overflow-hidden rounded-xl mb-6">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Category */}
        {post.category && (
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-[var(--primary-light)] text-[var(--primary)] mb-4">
            {post.category}
          </span>
        )}

        {/* Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)] mb-4">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            {icons.calendar}
            <span>{t('publishedAt')}: {formatDate(post.published_at)}</span>
          </div>
          {post.view_count !== null && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              {icons.eye}
              <span>{post.view_count} views</span>
            </div>
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors ml-auto"
          >
            {icons.share}
            <span>{t('shareArticle')}</span>
          </button>
        </div>

        {/* Content */}
        <div
          className="prose prose-sm sm:prose max-w-none text-[var(--text)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
              {icons.tag}
              {t('tags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm rounded-full bg-[var(--card-hover)] text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Comments */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <CommentSection
            comments={comments}
            entityType="blog_post"
            entityId={post.id}
            currentUserId={currentUserId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
