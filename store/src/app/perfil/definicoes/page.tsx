import { PushToggle } from "@/components/profile/PushToggle";
import { getProfileSubscription } from "@/lib/notifications/actions";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";

export default async function SettingsPage() {
  const pushSubscription = await getProfileSubscription();

  return (
    <div className="space-y-12">
      <ProfileSectionHeader 
        title="Definições"
        description="Gira as suas preferências de sistema e definições de notificações."
      />

      <div className="max-w-2xl">
        <PushToggle initialSubscription={pushSubscription} />
      </div>
    </div>
  );
}
