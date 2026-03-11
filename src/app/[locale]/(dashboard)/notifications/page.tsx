import { getMyNotifications } from '@/lib/data/notifications';
import NotificationsPageClient from './NotificationsPageClient';

export default async function NotificationsPage() {
  const notifications = await getMyNotifications({ limit: 50 });

  return <NotificationsPageClient notifications={notifications} />;
}
