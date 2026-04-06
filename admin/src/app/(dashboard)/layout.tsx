import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DesktopDashboardNav, MobileDashboardNav } from "@/components/dashboard/DashboardNav";
import { SidebarUser } from "@/components/dashboard/SidebarUser";
import { NotificationBell } from "@/components/notifications/NotificationBell";
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
  const displayName =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.email ??
    "Administrador";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-6 py-6 md:flex md:flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center">
            <Image
              src="/icon1.png"
              alt="Ramos Glamour"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <NotificationBell initialNotifications={notifications} />
        </div>

        <DesktopDashboardNav />
        <SidebarUser name={displayName} email={user.email ?? ""} />
      </aside>

      <div className="flex min-h-screen flex-col md:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center">
              <Image
                src="/icon1.png"
                alt="Ramos Glamour"
                width={144}
                height={36}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
            <NotificationBell initialNotifications={notifications} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>

      <MobileDashboardNav />
    </div>
  );
}
