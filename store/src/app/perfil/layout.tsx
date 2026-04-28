import { redirect } from "next/navigation";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getProfile } from "@/lib/actions/profile";
import { ProfileIdentity } from "@/components/profile/ProfileIdentity";

export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [profile, dashboardData] = await Promise.all([
    getProfile(),
    getDashboardData(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      {/* Administrative Identity Header */}
      <section className="bg-brand-white/50 border-b border-brand-midnight/5 py-10 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <ProfileIdentity 
            profile={profile} 
            location={dashboardData.location} 
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-12 lg:px-12 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-32">
            <ProfileNav />
          </aside>
          
          {/* Mobile Nav (Scrollable) */}
          <div className="lg:hidden -mx-6 px-6 overflow-x-auto pb-4 mb-8 border-b border-brand-midnight/5">
            <ProfileNav />
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </section>
    </main>
  );
}
