import { getCurrentUserProfile } from '@/lib/data/profiles';
import { getMyCases, getCaseStats } from '@/lib/data/cases';
import CasesPageClient from './CasesPageClient';

export default async function CasesPage() {
  const profile = await getCurrentUserProfile();
  const cases = await getMyCases();
  const stats = await getCaseStats(profile?.id);

  return <CasesPageClient cases={cases} stats={stats} />;
}
