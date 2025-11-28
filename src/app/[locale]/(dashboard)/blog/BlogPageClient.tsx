'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import Card from '@/components/ui/Card';
import { Database } from '@/types/database.types';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

interface BlogPageClientProps {
  posts: BlogPost[];
  stats: {
    total: number;
    byCategory: Record<string, number>;
  };
  categories: string[];
}

const icons = {
  article: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
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
  arrow: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  ),
  empty: (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
};

export default function BlogPageClient({ posts, stats, categories }: BlogPageClientProps) {
  const t = useTranslations('blog');
  const tCommon = useTranslations('common');

  const [filters, setFilters] = useState({ search: '', category: '' });

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(searchLower);
        const matchesExcerpt = post.excerpt?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesExcerpt) return false;
      }

      // Category filter
      if (filters.category && post.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [posts, filters]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text)]">
          {t('title')}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Card */}
      <Card padding="sm">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
            {icons.article}
          </div>
          <div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--text)]">
              {stats.total}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              {t('totalArticles')}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {icons.search}
            </div>
            <input
              type="text"
              placeholder={tCommon('searchPlaceholder')}
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm min-w-[140px]"
          >
            <option value="">{tCommon('all')} {t('category')}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Blog Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                {/* Featured Image */}
                {post.featured_image && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-xl -mt-4 -mx-4 mb-4">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Category Badge */}
                {post.category && (
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-[var(--primary-light)] text-[var(--primary)] mb-2">
                    {post.category}
                  </span>
                )}

                {/* Title */}
                <h3 className="font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    {icons.calendar}
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] group-hover:gap-2 transition-all">
                    {t('readMore')}
                    {icons.arrow}
                  </span>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-[var(--card-hover)] text-[var(--text-muted)]"
                      >
                        {icons.tag}
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="text-[var(--text-light)] mb-4">
              {icons.empty}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
              {t('noPosts')}
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md">
              {filters.search || filters.category
                ? tCommon('noResults')
                : t('noPostsHint')}
            </p>
          </div>
        </Card>
      )}

      {/* Results count */}
      {filteredPosts.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          {tCommon('showing')} {filteredPosts.length} {tCommon('of')} {posts.length}
        </p>
      )}
    </div>
  );
}
