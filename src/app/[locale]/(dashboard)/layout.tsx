import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { getCurrentUserProfile } from '@/lib/data/profiles';
import { getUser } from '@/lib/auth';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentUserProfile();

  const userData = profile ? {
    name: profile.company_name || `${profile.contact_first_name || ''} ${profile.contact_last_name || ''}`.trim() || 'Partner',
    email: profile.email,
    avatar: profile.logo_url || undefined,
    role: profile.role,
  } : {
    name: user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: undefined,
    role: 'PARTNER',
  };

  return <DashboardLayout user={userData}>{children}</DashboardLayout>;
}
