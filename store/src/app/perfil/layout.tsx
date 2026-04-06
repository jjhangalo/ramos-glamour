import { redirect } from "next/navigation";

import { ProfileNav } from "@/components/profile/ProfileNav";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-start">
        <aside className="hidden rounded-[2rem] bg-white/85 p-4 shadow-[0_16px_35px_rgba(98,98,96,0.08)] md:block">
          <ProfileNav />
        </aside>
        <div>{children}</div>
      </div>
    </main>
  );
}
