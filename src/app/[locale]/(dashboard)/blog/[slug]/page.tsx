import { notFound } from 'next/navigation';
import { getBlogPost, incrementBlogViewCount } from '@/lib/data/blog';
import BlogPostClient from './BlogPostClient';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Increment view count
  await incrementBlogViewCount(slug);

  return <BlogPostClient post={post} />;
}
