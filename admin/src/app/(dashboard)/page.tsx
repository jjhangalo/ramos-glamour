import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: clientsCount },
    { count: ordersCount },
    { count: pendingOrdersCount },
    { count: activeProductsCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select(
        "id, total, status, created_at, profiles(full_name, display_name)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const metrics = [
    { label: "Clientes registados", value: clientsCount ?? 0 },
    { label: "Total de encomendas", value: ordersCount ?? 0 },
    { label: "Encomendas pendentes", value: pendingOrdersCount ?? 0 },
    { label: "Produtos activos", value: activeProductsCount ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Painel
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Visão geral do backoffice
        </h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Encomendas recentes
            </h2>
            <p className="text-sm text-slate-500">
              Últimas 5 encomendas registadas.
            </p>
          </div>
          <Link
            href="/encomendas"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="px-5 py-4 font-medium text-slate-950">
                    #{shortId(order.id)}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {order.profiles?.full_name ||
                      order.profiles?.display_name ||
                      "Cliente sem nome"}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
              {!recentOrders?.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Ainda não há encomendas registadas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
