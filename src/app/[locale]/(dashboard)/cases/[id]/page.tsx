import { notFound } from 'next/navigation';
import { getMyCase } from '@/lib/data/cases';
import CaseDetailClient from './CaseDetailClient';

interface CaseDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const caseData = await getMyCase(id);

  if (!caseData) {
    notFound();
  }

  return <CaseDetailClient caseData={caseData} />;
}
