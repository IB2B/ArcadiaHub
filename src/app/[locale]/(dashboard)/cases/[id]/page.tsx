import { notFound } from 'next/navigation';
import { getMyCase } from '@/lib/data/cases';
import { getComments } from '@/lib/data/comments';
import { createClient } from '@/lib/database/server';
import CaseDetailClient from './CaseDetailClient';

interface CaseDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [caseData, comments] = await Promise.all([
    getMyCase(id),
    getComments('case', id),
  ]);

  if (!caseData) {
    notFound();
  }

  return <CaseDetailClient caseData={caseData} comments={comments} currentUserId={user?.id} />;
}
