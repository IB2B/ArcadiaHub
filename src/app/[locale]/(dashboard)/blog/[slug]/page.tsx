import { notFound } from 'next/navigation';
import { getBlogPost, incrementBlogViewCount } from '@/lib/data/blog';
import { getComments } from '@/lib/data/comments';
import { createClient } from '@/lib/database/server';
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const comments = await getComments('blog_post', post.id);

  return <BlogPostClient post={post} comments={comments} currentUserId={user?.id} />;
}
