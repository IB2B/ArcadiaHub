import { notFound } from 'next/navigation';
import { getProfile } from '@/lib/data/profiles';
import PartnerDetailClient from './PartnerDetailClient';

interface PartnerDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { id } = await params;
  const partner = await getProfile(id);

  if (!partner || partner.role !== 'PARTNER') {
    notFound();
  }

  return <PartnerDetailClient partner={partner} />;
}
