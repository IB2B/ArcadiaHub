import { getCurrentUserProfile } from '@/lib/data/profiles';
import SettingsPageClient from './SettingsPageClient';

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();
  const prefs = (profile?.notification_preferences as Record<string, boolean> | null) ?? {};

  return (
    <SettingsPageClient
      notificationPreferences={{
        email_case_updates: prefs.email_case_updates ?? true,
        email_events: prefs.email_events ?? true,
        email_content: prefs.email_content ?? true,
        email_mentions: prefs.email_mentions ?? true,
      }}
    />
  );
}
