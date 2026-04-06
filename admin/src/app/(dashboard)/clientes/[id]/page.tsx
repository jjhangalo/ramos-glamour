import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNotesCard } from "@/components/clients/AdminNotesCard";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Clientes
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            {client.full_name || client.display_name || "Cliente sem nome"}
          </h1>
        </div>
        <Link
          href="/clientes"
          className="inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Voltar aos clientes
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_420px]">
        <section className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-5 md:flex-row">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-100">
                {client.avatar_url ? (
                  <Image
                    src={client.avatar_url}
                    alt={client.full_name || client.display_name || "Avatar"}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <dl className="grid flex-1 gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Nome completo
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {client.full_name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Nome de apresentação
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {client.display_name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {client.email || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Telefone
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {client.phone || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    WhatsApp
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {client.whatsapp || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Estado
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {client.is_active ? "Activo" : "Inactivo"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Registo
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatDate(client.created_at)}
                  </dd>
                </div>
              </dl>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Moradas guardadas
            </h2>
            <div className="mt-4 grid gap-4">
              {addresses.length ? (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-950">
                        {address.label || "Sem etiqueta"}
                      </p>
                      {address.is_default ? (
                        <span className="rounded-full bg-slate-950 px-2 py-1 text-[11px] font-medium text-white">
                          Principal
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1">{address.recipient_name || "Sem destinatário"}</p>
                    <p>{address.phone || "Sem telefone"}</p>
                    <p>
                      {[address.street, address.neighborhood]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>
                      {[address.city, address.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>{address.reference || "Sem ponto de referência"}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Sem moradas"
                  description="Este cliente ainda não guardou moradas."
                />
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Histórico de encomendas
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr className="border-b border-slate-200">
                    <th className="py-3 pr-4 font-medium">ID</th>
                    <th className="py-3 pr-4 font-medium">Data</th>
                    <th className="py-3 pr-4 font-medium">Total</th>
                    <th className="py-3 pr-4 font-medium">Estado</th>
                    <th className="py-3 font-medium">Acção</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-4 pr-4 font-medium text-slate-950">
                        #{shortId(order.id)}
                      </td>
                      <td className="py-4 pr-4 text-slate-700">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-4 pr-4 text-slate-700">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/encomendas/${order.id}`}
                          className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
                        >
                          Ver encomenda
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!orders.length ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-slate-500">
                        Este cliente ainda não tem encomendas.
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
    </div>
  );
}
