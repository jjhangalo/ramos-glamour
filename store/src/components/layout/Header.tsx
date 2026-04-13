import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userData = user
    ? {
        avatarUrl: user.user_metadata.avatar_url as string || null,
        displayName: (user.user_metadata.display_name as string) || (user.user_metadata.full_name as string) || null,
        email: user.email || null,
      }
    : null;

  return <HeaderClient user={userData} />;
}
