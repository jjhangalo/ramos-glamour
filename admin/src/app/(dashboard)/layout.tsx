import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DesktopDashboardNav, MobileDashboardNav } from "@/components/dashboard/DashboardNav";
import { SidebarUser } from "@/components/dashboard/SidebarUser";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PageTransition } from "@/components/shared/PageTransition";
import { getUnreadNotifications } from "@/lib/actions/notifications";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await getUnreadNotifications();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // Redirect to the dedicated signout route so the Set-Cookie header
    // (clearing the session) is flushed before the browser navigates to
    // the login page. Calling signOut() directly in a Server Component
    // layout can lose the cookie mutation when redirect() throws.
    redirect("/api/auth/signout?error=unauthorized");
  }

  const displayName =
    profile?.display_name ??
    profile?.full_name ??
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email ??
    "Administrador";

  return (
    <div className="min-h-screen bg-brand-bg text-brand-midnight font-sans">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-brand-midnight/5 bg-white/50 backdrop-blur-md px-6 py-8 lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center">
            <Image
              src="/logo-gold.png"
              alt="Ramos Glamour"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              style={{ width: "auto", height: "100%" }}
              priority
            />
          </Link>
          <NotificationBell initialNotifications={notifications} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <DesktopDashboardNav />
        </div>

        <SidebarUser
          id={user.id}
          name={displayName}
          email={user.email ?? ""}
          avatarUrl={profile?.avatar_url}
          role={profile?.role}
        />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-brand-midnight/5 bg-brand-bg/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-4">
            {/* Menu trigger (Sheet) */}
            <MobileDashboardNav
              user={{
                id: user.id,
                name: displayName,
                avatarUrl: profile?.avatar_url,
                role: profile?.role,
                email: user.email ?? "",
              }}
            />

            {/* Logo centred */}
            <Link href="/" className="flex min-w-0 items-center">
              <Image
                src="/logo-gold.png"
                alt="Ramos Glamour"
                width={120}
                height={30}
                className="h-8 w-auto object-contain brightness-0"
                style={{ width: "auto", height: "100%" }}
                priority
              />
            </Link>

            {/* Notification Bell */}
            <NotificationBell initialNotifications={notifications} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
