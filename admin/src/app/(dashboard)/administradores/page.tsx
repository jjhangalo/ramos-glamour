import { getClients, getAllPendingPromotions } from "@/lib/actions/clients";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminActions } from "@/components/administradores/AdminActions";
import { AddAdminDialog } from "@/components/administradores/AddAdminDialog";
import { PendingPromotionsList } from "@/components/administradores/PendingPromotionsList";
import { PageCanvas } from "@/components/ui/page-canvas";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";
import { Mail, Phone, Shield, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminsPageProps = {
  searchParams?: Promise<{
    pesquisa?: string;
  }>;
};

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
  const params = (await searchParams) ?? {};
  const [
    { clients: admins }, 
    pendingRequests, 
    supabase
  ] = await Promise.all([
    getClients({
      search: params.pesquisa,
      role: "admin",
      pageSize: 100,
    }),
    getAllPendingPromotions(),
    createClient()
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <PageCanvas size="list" className="space-y-12 py-12 pb-32">
      {/* Header Section */}
      <FadeUp className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/30">
            Governança & Acesso
          </p>
          <h1 className="heading-luxury mt-1 text-4xl font-light text-brand-midnight">
            Gestão de Administradores
          </h1>
        </div>
        <AddAdminDialog />
      </FadeUp>

      {/* Pending Promotions Section */}
      {pendingRequests.length > 0 && (
        <FadeUp delay={0.1}>
          <PendingPromotionsList requests={pendingRequests} currentUserId={user?.id} />
        </FadeUp>
      )}

      {/* Admins List Section */}
      <section className="space-y-8">
        <FadeUp delay={0.2} className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-midnight/5 text-brand-midnight/40">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="heading-luxury text-xl font-medium text-brand-midnight">
                Administradores Ativos
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                Acesso Total à Plataforma
              </p>
            </div>
          </div>

          <form className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-midnight/20" />
            <input
              type="search"
              name="pesquisa"
              defaultValue={params.pesquisa ?? ""}
              placeholder="Procurar administrador..."
              className="w-full rounded-2xl border border-brand-midnight/5 bg-white py-3 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-brand-gold/30 focus:ring-4 focus:ring-brand-gold/5"
            />
          </form>
        </FadeUp>

        {admins.length ? (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {admins.map((admin) => (
              <StaggerItem key={admin.id}>
                <article className="group relative rounded-[2rem] border border-brand-midnight/5 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-brand-midnight truncate">
                        {admin.full_name || admin.display_name || "Sem nome"}
                      </h3>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-brand-midnight/30 mt-1">
                        ID: {admin.id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-brand-midnight/5 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg/50 text-brand-midnight/40">
                          <Mail className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-medium text-brand-midnight/70 truncate">
                          {admin.email || "Email N/D"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg/50 text-brand-midnight/40">
                          <Phone className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-medium text-brand-midnight/70">
                          {admin.phone || "Telefone N/D"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-brand-midnight/5 pt-6">
                      <span className={cn(
                        "inline-flex rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
                        admin.is_active 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-brand-midnight/5 text-brand-midnight/20 border-transparent"
                      )}>
                        {admin.is_active ? "Ativo" : "Inativo"}
                      </span>
                      <AdminActions userId={admin.id} />
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <FadeUp delay={0.3}>
            <EmptyState
              title="Nenhum administrador encontrado"
              description="Ajusta a tua pesquisa ou promove um cliente a administrador através do seu perfil."
            />
          </FadeUp>
        )}
      </section>
    </PageCanvas>
  );
}
