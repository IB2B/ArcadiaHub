import { getPartners } from '@/lib/data/profiles';
import CommunityPageClient from './CommunityPageClient';

export default async function CommunityPage() {
  const { data: partners, count } = await getPartners({ isActive: true, limit: 100 });

  return <CommunityPageClient partners={partners} totalCount={count} />;
}
