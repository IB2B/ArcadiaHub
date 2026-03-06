import { redirect } from '@/navigation';
import { getCurrentUserProfile } from '@/lib/data/profiles';
import ProfilePageClient from './ProfilePageClient';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect({ href: '/login', locale });
  }

  return <ProfilePageClient profile={profile!} />;
}
