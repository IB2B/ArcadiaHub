import { getTranslations } from 'next-intl/server';
import { getAdminBlogPosts } from '@/lib/data/admin';
import BlogClient from './BlogClient';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    published?: string;
  }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const t = await getTranslations('admin.blog');

  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const category = params.category || '';
  const published = params.published === 'true' ? true : params.published === 'false' ? false : undefined;

  const blogData = await getAdminBlogPosts({
    page,
    pageSize: 10,
    search,
    category: category || undefined,
    published,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Blog List Client Component */}
      <BlogClient
        initialData={blogData}
        initialFilters={{ search, category, published: params.published || '' }}
      />
    </div>
  );
}
