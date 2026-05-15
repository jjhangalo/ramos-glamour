import { createClient } from "@/lib/supabase/server";
import { getClient } from "@/lib/actions/clients";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { DndForm } from "@/components/settings/DndForm";
import { NotificationToggle } from "@/components/settings/NotificationToggle";
import { PageCanvas } from "@/components/ui/page-canvas";
import { FadeUp } from "@/components/shared/Animations";
import { Shield, UserCircle, Lock, Moon } from "lucide-react";
import { notFound } from "next/navigation";
 
export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
 
  if (!user) {
    notFound();
  }
 
  const { client } = await getClient(user.id);
 
  return (
    <PageCanvas size="list" className="space-y-12 py-12 pb-32">
      {/* Header Section */}
      <FadeUp className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/30">
          Personalização & Segurança
        </p>
        <h1 className="heading-luxury text-4xl font-light text-brand-midnight">
          Definições de Conta
        </h1>
      </FadeUp>
 
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-12">
          {/* Profile Section */}
          <FadeUp delay={0.1} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-midnight/5 text-brand-midnight/40">
                <UserCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="heading-luxury text-xl font-medium text-brand-midnight">
                  Informação de Perfil
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Dados Públicos e Identidade
                </p>
              </div>
            </div>
 
            <div className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 md:p-10 shadow-sm transition-shadow hover:shadow-md">
              <ProfileForm admin={client} />
            </div>
          </FadeUp>
 
          {/* DND & Notifications Section */}
          <FadeUp delay={0.2} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-midnight/5 text-brand-midnight/40">
                <Moon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="heading-luxury text-xl font-medium text-brand-midnight">
                  Notificações & Descanso
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Gestão de Alertas e Modo Não Incomodar
                </p>
              </div>
            </div>
 
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 md:p-10 shadow-sm transition-shadow hover:shadow-md">
                <NotificationToggle initialSubscription={client.push_subscription ?? null} />
              </div>
              <div className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 md:p-10 shadow-sm transition-shadow hover:shadow-md">
                <DndForm admin={client} />
              </div>
            </div>
          </FadeUp>

          {/* Security Section */}
          <FadeUp delay={0.3} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-midnight/5 text-brand-midnight/40">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="heading-luxury text-xl font-medium text-brand-midnight">
                  Segurança de Acesso
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Proteção e Credenciais
                </p>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 md:p-10 shadow-sm transition-shadow hover:shadow-md">
              <PasswordForm />
            </div>
          </FadeUp>
        </div>

        {/* Sidebar / Info */}
        <aside className="space-y-6">
          <FadeUp delay={0.3} className="rounded-[2rem] border border-brand-midnight/5 bg-brand-midnight p-8 text-white">
            <Shield className="mb-4 h-8 w-8 text-brand-gold" />
            <h3 className="heading-luxury text-lg font-medium text-white">Segurança Corporativa</h3>
            <p className="mt-4 text-xs leading-relaxed text-white/60">
              O seu email corporativo é gerido centralmente. Caso necessite de alterar o email de acesso, por favor contacte o administrador mestre do sistema.
            </p>
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-tight">
                Última atualização de perfil: 
                <br />
                <span className="text-white/60">{new Date(client.updated_at).toLocaleDateString()}</span>
              </p>
            </div>
          </FadeUp>
        </aside>
      </div>
    </PageCanvas>
  );
}
