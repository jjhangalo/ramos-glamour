import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getProfile } from "@/lib/actions/profile";
import { ProfileIdentity } from "@/components/profile/ProfileIdentity";
import { ProfileNav } from "@/components/profile/ProfileNav";

export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [profile, dashboardData] = await Promise.all([
    getProfile(),
    getDashboardData(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-8 lg:px-12 lg:py-16">
        <div className="flex gap-16 lg:items-start">
          {/* Desktop Sidebar — hidden on mobile */}
          <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8 lg:sticky lg:top-32">
            <ProfileIdentity
              profile={profile}
              location={dashboardData.location}
            />
            <ProfileNav />
          </aside>

          {/* Detail Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
