import { notFound } from 'next/navigation';
import { getDocument, getDocuments } from '@/lib/data/documents';
import DocumentDetailClient from './DocumentDetailClient';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = await params;
  const document = await getDocument(id);

  if (!document) {
    notFound();
  }

  // Get related documents (same category, excluding current)
  const { data: allDocs } = await getDocuments({ category: document.category, limit: 4 });
  const relatedDocs = allDocs.filter((d) => d.id !== document.id).slice(0, 3);

  return <DocumentDetailClient document={document} relatedDocs={relatedDocs} />;
}
