import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/data/profiles';
import ProfilePageClient from './ProfilePageClient';

export default async function ProfilePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return <ProfilePageClient profile={profile} />;
}
