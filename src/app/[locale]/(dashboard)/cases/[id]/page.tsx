import { notFound } from 'next/navigation';
import { getMyCase, uploadCaseDocument } from '@/lib/data/cases';
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

  const uploadDocumentAction = uploadCaseDocument.bind(null, id);

  return <CaseDetailClient caseData={caseData} uploadDocumentAction={uploadDocumentAction} />;
}
