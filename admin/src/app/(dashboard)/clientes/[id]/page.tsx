import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNotesCard } from "@/components/clients/AdminNotesCard";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageCanvas } from "@/components/ui/page-canvas";
import { cn } from "@/lib/utils";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { getClient } from "@/lib/actions/clients";

type ClientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { id } = await params;
  const data = await getClient(id).catch(() => null);

  if (!data) {
    notFound();
  }

  const { client, addresses, orders } = data;

  return (
    <PageCanvas size="list" className="space-y-8 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Clientes
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            {client.full_name || client.display_name || "Cliente sem nome"}
          </h1>
        </div>
        <Link
          href="/clientes"
          className="inline-flex rounded-md border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 shadow-sm"
        >
          Voltar
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50 shadow-inner">
                {client.avatar_url ? (
                  <Image
                    src={client.avatar_url}
                    alt={client.full_name || client.display_name || "Avatar"}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <dl className="grid flex-1 gap-6 md:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nome completo
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {client.full_name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nome de apresentação
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {client.display_name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {client.email || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Telefone
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {client.phone || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    WhatsApp
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">
                    {client.whatsapp || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Estado
                  </dt>
                  <dd className="mt-1">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      client.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {client.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Data de Registo
                  </dt>
                  <dd className="mt-1 text-xs text-slate-500">
                    {formatDate(client.created_at)}
                  </dd>
                </div>
              </dl>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-6 border-b border-slate-100 pb-3">
              Moradas guardadas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.length ? (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/30 p-4 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {address.label || "Residência"}
                      </p>
                      {address.is_default ? (
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                          Principal
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="font-bold text-slate-900">{address.recipient_name || "Sem nome"}</p>
                      <p className="text-xs text-slate-500">{address.phone}</p>
                      <p className="mt-2 text-xs">
                        {[address.street, address.neighborhood]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p className="text-xs">
                        {[address.city, address.province]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="sm:col-span-2 py-8 text-center text-slate-400 italic text-sm">
                  Este cliente ainda não guardou moradas de entrega.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-6 py-4 border-b border-slate-100 bg-slate-50">
              Histórico de operações
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3 text-right">Acção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-950">
                        #{shortId(order.id)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/encomendas/${order.id}`}
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!orders.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        Nenhuma encomenda registada para este cliente.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <aside className="space-y-6">
          <AdminNotesCard
            clientId={client.id}
            initialNotes={client.admin_notes || ""}
            isActive={client.is_active}
          />
        </aside>
      </div>
    </PageCanvas>
  );
}
