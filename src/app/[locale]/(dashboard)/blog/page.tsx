import { getBlogPosts, getBlogStats, getBlogCategories } from '@/lib/data/blog';
import BlogPageClient from './BlogPageClient';

export default async function BlogPage() {
  const { data: posts } = await getBlogPosts();
  const stats = await getBlogStats();
  const categories = await getBlogCategories();

  return <BlogPageClient posts={posts} stats={stats} categories={categories} />;
}
