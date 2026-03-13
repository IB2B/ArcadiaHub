import { notFound } from 'next/navigation';
import { getAcademyItem, getAcademyContent, getMyCompletions } from '@/lib/data/academy';
import { getComments } from '@/lib/data/comments';
import { createClient } from '@/lib/database/server';
import AcademyDetailClient from './AcademyDetailClient';

interface AcademyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AcademyDetailPage({ params }: AcademyDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: { user } }, item, completions, comments] = await Promise.all([
    supabase.auth.getUser(),
    getAcademyItem(id),
    getMyCompletions(),
    getComments('academy_content', id),
  ]);

  if (!item) {
    notFound();
  }

  // Get related content (same type, excluding current)
  const { data: allContent } = await getAcademyContent({ contentType: item.content_type, limit: 4 });
  const relatedContent = allContent.filter((c) => c.id !== item.id).slice(0, 3);

  return (
    <AcademyDetailClient
      item={item}
      relatedContent={relatedContent}
      isCompleted={completions.includes(id)}
      comments={comments}
      currentUserId={user?.id}
    />
  );
}
