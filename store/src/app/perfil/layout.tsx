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
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
          Área do cliente
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-brand-charcoal">
          A tua conta
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-[2rem] bg-white/85 p-4 shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
          <ProfileNav />
        </aside>
        <div>{children}</div>
      </div>
    </main>
  );
}
