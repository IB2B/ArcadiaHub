import { getAcademyContent, getAcademyStats } from '@/lib/data/academy';
import AcademyPageClient from './AcademyPageClient';

export default async function AcademyPage() {
  const { data: content } = await getAcademyContent();
  const stats = await getAcademyStats();

  return <AcademyPageClient content={content} stats={stats} />;
}
