import { redirect } from "next/navigation";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="flex flex-1 flex-col">
      {/* Editorial Header */}
      <section className="bg-brand-white border-b border-brand-midnight/5 py-12 md:py-24">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold mb-4">
              A SUA CONTA
            </p>
            <h1 className="heading-luxury text-4xl font-light md:text-7xl">
              Olá, <span className="italic">{user.user_metadata.full_name?.split(' ')[0] || 'Cliente'}</span>
            </h1>
          </div>
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
