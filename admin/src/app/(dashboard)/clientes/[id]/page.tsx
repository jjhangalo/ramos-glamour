import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar, Hash, MapPin, ShoppingBag, ChevronRight } from "lucide-react";

import { AdminNotesCard } from "@/components/clients/AdminNotesCard";
import { PromotionGovernanceCard } from "@/components/clients/PromotionGovernanceCard";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { getClient } from "@/lib/actions/clients";
import { createClient } from "@/lib/supabase/server";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { id } = await params;
  const [data, supabase] = await Promise.all([
    getClient(id).catch(() => null),
    createClient()
  ]);

  if (!data) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { client, addresses, orders } = data;

  return (
    <PageCanvas size="list" className="space-y-12 py-12 pb-32">
      {/* Header & Back Button */}
      <FadeUp className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/clientes"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-midnight/5 bg-white shadow-sm transition-all hover:bg-brand-bg/50 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-brand-midnight" />
          </Link>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/30">
              Perfil do Cliente
            </p>
            <h1 className="heading-luxury mt-1 text-4xl font-light text-brand-midnight">
              Gestão de Cliente
            </h1>
          </div>
        </div>
      </FadeUp>

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <div className="space-y-10">
          {/* Main Profile Card */}
          <FadeUp delay={0.1}>
            <article className="rounded-[2.5rem] border border-brand-midnight/5 bg-white p-8 md:p-10 shadow-sm overflow-hidden">
              <div className="flex flex-col gap-10 md:flex-col md:items-start">
                <div className="flex flex-row gap-8 sm:flex-row sm:items-center">
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[2rem] border border-brand-midnight/5 bg-brand-bg/50 shadow-inner transition-transform hover:scale-105">
                    {client.avatar_url ? (
                      <Image
                        src={client.avatar_url}
                        alt={client.full_name || client.display_name || "Avatar"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand-midnight/20">
                        {client.full_name?.charAt(0) || client.display_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="heading-luxury text-3xl font-medium text-brand-midnight leading-tight">
                      {client.full_name || client.display_name || "Cliente sem nome"}
                    </h2>
                    <p className="text-sm font-medium text-brand-midnight/40 tracking-wide">
                      @{client.display_name || "username_indisponivel"}
                    </p>
                  </div>
                </div>

                <div className="grid flex-1 gap-y-8 gap-x-12 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                      <Hash className="h-3 w-3" /> Identificação
                    </p>
                    <p className="font-mono text-xs font-bold text-brand-midnight/60">
                      ID: {client.id}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                      <Calendar className="h-3 w-3" /> Membro desde
                    </p>
                    <p className="text-sm font-bold text-brand-midnight">
                      {formatDate(client.created_at)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                      <Mail className="h-3 w-3" /> Email de Contacto
                    </p>
                    <p className="text-sm font-bold text-brand-midnight">
                      {client.email || "—"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                      <Phone className="h-3 w-3" /> Telefone / WhatsApp
                    </p>
                    <p className="text-sm font-bold text-brand-midnight">
                      {client.phone || client.whatsapp || "—"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 space-y-2 pt-4 border-t border-brand-midnight/5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                      Estado da Conta
                    </p>
                    <span className={cn(
                      "inline-flex rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest",
                      client.is_active
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-brand-midnight/5 text-brand-midnight/20 border border-brand-midnight/5"
                    )}>
                      {client.is_active ? "Perfil Ativo" : "Perfil Inativo"}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </FadeUp>

          {/* Addresses Section */}
          <section className="space-y-6">
            <FadeUp delay={0.2} className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-brand-midnight/30" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
                Moradas de Entrega
              </h2>
            </FadeUp>

            <StaggerContainer className="grid gap-4 sm:grid-cols-2">
              {addresses.length ? (
                addresses.map((address) => (
                  <StaggerItem
                    key={address.id}
                    className="group relative overflow-hidden rounded-[2rem] border border-brand-midnight/5 bg-white p-6 transition-all hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-midnight/5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-midnight/30">
                        {address.label || "Morada"}
                      </span>
                      {address.is_default && (
                        <span className="rounded-full bg-brand-midnight px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                          Principal
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-brand-midnight">{address.recipient_name}</p>
                      <p className="text-xs text-brand-midnight/50">{address.phone}</p>
                      <div className="mt-4 pt-4 border-t border-brand-midnight/5 text-xs text-brand-midnight/70 leading-relaxed">
                        <p>{address.street}{address.neighborhood ? `, ${address.neighborhood}` : ""}</p>
                        <p>{address.city}, {address.province}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))
              ) : (
                <StaggerItem className="sm:col-span-2 py-16 text-center rounded-[2rem] border border-dashed border-brand-midnight/10 bg-brand-bg/5">
                  <p className="text-sm font-bold text-brand-midnight/30 italic">
                    Nenhuma morada guardada por este cliente.
                  </p>
                </StaggerItem>
              )}
            </StaggerContainer>
          </section>

          {/* Order History Section */}
          <section className="space-y-6">
            <FadeUp delay={0.3} className="flex items-center gap-4">
              <ShoppingBag className="h-5 w-5 text-brand-midnight/30" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
                Histórico de Encomendas
              </h2>
            </FadeUp>

            <StaggerContainer className="space-y-4">
              {orders.length ? (
                orders.map((order) => (
                  <StaggerItem
                    key={order.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden rounded-[2rem] border border-brand-midnight/5 bg-white p-6 transition-all hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-midnight/5"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-bg/50 text-brand-midnight/40 transition-colors group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold text-brand-midnight">
                          #{shortId(order.id)}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-midnight/30">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-10 border-t border-brand-midnight/5 pt-4 sm:border-0 sm:pt-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-brand-midnight">
                          {formatPrice(order.total)}
                        </p>
                        <StatusBadge status={order.status} />
                      </div>
                      <Link
                        href={`/encomendas/${order.id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg/50 text-brand-midnight/40 transition-all hover:bg-brand-midnight hover:text-white active:scale-90"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </StaggerItem>
                ))
              ) : (
                <StaggerItem className="py-20 text-center rounded-[2rem] border border-dashed border-brand-midnight/10 bg-brand-bg/5">
                  <p className="text-sm font-bold text-brand-midnight/30 italic">
                    O cliente ainda não realizou encomendas.
                  </p>
                </StaggerItem>
              )}
            </StaggerContainer>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <AdminNotesCard
            clientId={client.id}
            initialNotes={client.admin_notes || ""}
            isActive={client.is_active}
          />
          
          {/* Governance Section */}
          <PromotionGovernanceCard client={client} currentUserId={user?.id} />
        </aside>
      </div>
    </PageCanvas>
  );
}

