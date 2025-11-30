import { notFound } from 'next/navigation';
import { getAcademyItem, getAcademyContent } from '@/lib/data/academy';
import AcademyDetailClient from './AcademyDetailClient';

interface AcademyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AcademyDetailPage({ params }: AcademyDetailPageProps) {
  const { id } = await params;
  const item = await getAcademyItem(id);

  if (!item) {
    notFound();
  }

  // Get related content (same type, excluding current)
  const { data: allContent } = await getAcademyContent({ contentType: item.content_type, limit: 4 });
  const relatedContent = allContent.filter((c) => c.id !== item.id).slice(0, 3);

  return <AcademyDetailClient item={item} relatedContent={relatedContent} />;
}
