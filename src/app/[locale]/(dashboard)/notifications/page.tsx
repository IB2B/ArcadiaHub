import { getMyNotifications } from '@/lib/data/notifications';
import NotificationsPageClient from './NotificationsPageClient';

export default async function NotificationsPage() {
  const notifications = await getMyNotifications();
  return <NotificationsPageClient notifications={notifications} />;
}
