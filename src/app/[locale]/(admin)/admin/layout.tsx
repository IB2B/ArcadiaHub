import { redirect } from '@/navigation';
import { AdminLayout } from '@/components/admin';
import { getCurrentUserProfile } from '@/lib/data/profiles';
import { getUser } from '@/lib/auth';
import { getPendingAccessRequestsCount } from '@/lib/data/accessRequests';

export default async function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  if (!user) {
    redirect({ href: '/login', locale });
  }

  const profile = await getCurrentUserProfile();

  // Check if user has admin role
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COMMERCIAL')) {
    redirect({ href: '/dashboard', locale });
  }

  // Fetch pending access requests count for badge
  const pendingRequestsCount = await getPendingAccessRequestsCount();

  const userData = {
    name: profile!.company_name || `${profile!.contact_first_name || ''} ${profile!.contact_last_name || ''}`.trim() || 'Admin',
    email: profile!.email,
    avatar: profile!.logo_url || undefined,
    role: profile!.role,
  };

  return (
    <AdminLayout user={userData} pendingAccessRequests={pendingRequestsCount}>
      {children}
    </AdminLayout>
  );
}
