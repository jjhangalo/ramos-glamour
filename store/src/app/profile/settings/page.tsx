import { PushToggle } from "@/components/profile/PushToggle";
import { getProfileSubscription } from "@/lib/notifications/actions";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";

export default async function SettingsPage() {
  const pushSubscription = await getProfileSubscription();

  return (
    <div className="space-y-12">
      <ProfileSectionHeader 
        title="Settings"
        description="Manage your system preferences and notification settings."
      />

      <div className="max-w-2xl">
        <PushToggle initialSubscription={pushSubscription} />
      </div>
    </div>
  );
}
