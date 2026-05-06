import Image from "next/image";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { getClients } from "@/lib/actions/clients";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientActions } from "@/components/clients/ClientActions";
import { PageHeader } from "@/components/list/PageHeader";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";
import { ClientPaginationWrapper } from "@/components/clients/ClientPaginationWrapper";

type ClientsPageProps = {
  searchParams?: Promise<{
    estado?: "all" | "active" | "inactive";
    pesquisa?: string;
    data?: string;
    dataInicio?: string;
    dataFim?: string;
    pagina?: string;
    limite?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = Number(params.pagina) || 1;
  const pageSize = Number(params.limite) || 12;

  const { clients, totalCount } = await getClients({
    status: params.estado,
    search: params.pesquisa,
    date: params.data,
    dateFrom: params.dataInicio,
    dateTo: params.dataFim,
    page: currentPage,
    pageSize: pageSize,
    role: "client",
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <PageCanvas size="list" className="space-y-8 py-12 pb-32">
      {/* Header Section */}
      <FadeUp>
        <PageHeader title="Clientes" />
        <p className="mt-2 text-sm text-brand-midnight/60">
          Gerencie sua base de clientes, visualize perfis detalhados e controle o acesso à plataforma.
        </p>
      </FadeUp>

      {/* Filters Section */}
      <FadeUp delay={0.1}>
        <ClientFilters params={params} />
      </FadeUp>

      {/* Results Count */}
      {totalCount > 0 && (
        <FadeUp delay={0.15}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
            {totalCount} cliente{totalCount !== 1 ? "s" : ""} registado{totalCount !== 1 ? "s" : ""}
          </p>
        </FadeUp>
      )}

      {clients.length ? (
        <>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <StaggerItem
                key={client.id}
                className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-brand-midnight/5 bg-white p-6 shadow-sm transition-all hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-midnight/5"
              >
                {/* Card Header: Avatar & Actions */}
                <div className="flex items-start justify-between">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-brand-bg/50 border border-brand-midnight/5 shadow-inner transition-transform group-hover:scale-105">
                    {client.avatar_url ? (
                      <Image
                        src={client.avatar_url}
                        alt={client.full_name || client.display_name || "Avatar"}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-midnight/20">
                        {client.full_name?.charAt(0) || client.display_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <ClientActions clientId={client.id} isActive={client.is_active} />
                </div>

                {/* Card Body: Info */}
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-midnight group-hover:text-brand-gold transition-colors truncate">
                      {client.full_name || client.display_name || "Sem nome"}
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-brand-midnight/30 mt-1">
                      ID: {client.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-brand-midnight/5 pt-4">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg/20 text-brand-midnight/40">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <span className={cn(
                        "text-xs font-medium truncate",
                        client.email ? "text-brand-midnight/70" : "text-brand-midnight/30 italic"
                      )}>
                        {client.email || "Email N/D"}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg/20 text-brand-midnight/40">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        client.phone ? "text-brand-midnight/70" : "text-brand-midnight/30 italic"
                      )}>
                        {client.phone || "Telefone N/D"}
                      </span>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-bg/20 text-brand-midnight/40">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        client.whatsapp ? "text-brand-midnight/70" : "text-brand-midnight/30 italic"
                      )}>
                        {client.whatsapp || "WhatsApp N/D"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Status & Date */}
                <div className="mt-8 flex items-center justify-between border-t border-brand-midnight/5 pt-4">
                  <span className={cn(
                    "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                    client.is_active
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-brand-midnight/5 text-brand-midnight/30 border border-brand-midnight/5"
                  )}>
                    {client.is_active ? "Activo" : "Inactivo"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-brand-midnight/20">
                    {formatDate(client.created_at)}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeUp delay={0.2}>
            <ClientPaginationWrapper
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
            />
          </FadeUp>
        </>
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
