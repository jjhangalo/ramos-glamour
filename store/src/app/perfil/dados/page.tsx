import { ProfileForm } from "@/components/profile/ProfileForm";
import { getProfile } from "@/lib/actions/profile";

export default async function ProfileDataPage() {
  const profile = await getProfile();

  return <ProfileForm profile={profile} />;
}
