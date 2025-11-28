import { getDocuments, getDocumentStats } from '@/lib/data/documents';
import DocumentsPageClient from './DocumentsPageClient';

export default async function DocumentsPage() {
  const { data: documents } = await getDocuments();
  const stats = await getDocumentStats();

  return <DocumentsPageClient documents={documents} stats={stats} />;
}
