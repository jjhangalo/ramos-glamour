import Image from "next/image";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { getClients } from "@/lib/actions/clients";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientActions } from "@/components/clients/ClientActions";
import { PageHeader } from "@/components/list/PageHeader";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";

type ClientsPageProps = {
  searchParams?: Promise<{
    estado?: "all" | "active" | "inactive";
    pesquisa?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = (await searchParams) ?? {};
  const clients = await getClients({
    status: params.estado,
    search: params.pesquisa,
    role: "client",
  });

  return (
    <PageCanvas size="list" className="space-y-8 py-12">
      {/* Header Section */}
      <FadeUp>
        <PageHeader title="Clientes" />
        <p className="mt-2 text-sm text-brand-midnight/60">
          Gerencie sua base de clientes, visualize perfis detalhados e controle o acesso à plataforma.
        </p>
      </FadeUp>

      {/* Filters Section */}
      <FadeUp delay={0.1}>
        <div className="rounded-2xl border border-brand-midnight/5 bg-white p-6 shadow-sm">
          <ClientFilters params={params} />
        </div>
      </FadeUp>

      {/* Results Count */}
      {clients.length > 0 && (
        <FadeUp delay={0.15}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} registado{clients.length !== 1 ? "s" : ""}
          </p>
        </FadeUp>
      )}

      {clients.length ? (
        <StaggerContainer className="overflow-hidden rounded-2xl border border-brand-midnight/5 bg-white shadow-sm">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-bg/40 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-midnight/40">
                <tr className="border-b border-brand-midnight/5">
                  <th className="hidden px-6 py-4 md:table-cell">Avatar</th>
                  <th className="px-6 py-4">Nome & Perfil</th>
                  <th className="hidden px-6 py-4 lg:table-cell">Contacto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="hidden px-6 py-4 lg:table-cell">Registo</th>
                  <th className="px-6 py-4 text-right">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-midnight/5">
                {clients.map((client) => (
                  <StaggerItem
                    key={client.id}
                    as="tr"
                    className="group transition-colors hover:bg-brand-bg/30"
                  >
                    <td className="hidden px-6 py-4 md:table-cell">
                      <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-brand-bg/50 border border-brand-midnight/5 shadow-inner transition-transform group-hover:scale-105">
                        {client.avatar_url ? (
                          <Image
                            src={client.avatar_url}
                            alt={client.full_name || client.display_name || "Avatar"}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-brand-midnight/20">
                            {client.full_name?.charAt(0) || client.display_name?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-midnight group-hover:text-brand-gold transition-colors">
                          {client.full_name || client.display_name || "Sem nome"}
                        </span>
                        <span className="text-[10px] font-mono text-brand-midnight/40">
                          ID: {client.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 lg:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-brand-midnight/70">
                          {client.email || "Sem email"}
                        </span>
                        {client.phone && (
                          <span className="text-[10px] text-brand-midnight/40">
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        client.is_active 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-brand-midnight/5 text-brand-midnight/30 border border-brand-midnight/5"
                      )}>
                        {client.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 lg:table-cell text-[10px] font-bold uppercase tracking-wider text-brand-midnight/30">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ClientActions clientId={client.id} isActive={client.is_active} />
                    </td>
                  </StaggerItem>
                ))}
              </tbody>
            </table>
          </div>
        </StaggerContainer>
      ) : (
        <FadeUp delay={0.2}>
          <div className="rounded-3xl border border-dashed border-brand-midnight/10 bg-white/50 p-24">
            <EmptyState
              title="Base de clientes vazia"
              description="Ajuste os seus critérios de pesquisa ou aguarde por novos registos na loja."
            />
          </div>
        </FadeUp>
      )}
    </PageCanvas>
  );
}
