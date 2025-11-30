import { getBlogPosts, getBlogStats, getBlogCategories } from '@/lib/data/blog';
import BlogPageClient from './BlogPageClient';

const PAGE_SIZE = 9;

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const search = params.search || '';
  const category = params.category || '';

  const offset = (page - 1) * PAGE_SIZE;

  const { data: posts, count } = await getBlogPosts({
    search: search || undefined,
    category: category || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const stats = await getBlogStats();
  const categories = await getBlogCategories();

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <BlogPageClient
      posts={posts}
      stats={stats}
      categories={categories}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: PAGE_SIZE,
      }}
      initialFilters={{
        search,
        category,
      }}
    />
  );
}
