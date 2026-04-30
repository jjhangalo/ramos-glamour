import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageCanvas } from "@/components/ui/page-canvas";

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
    <PageCanvas size="list" className="space-y-8 py-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950 tracking-tight">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Encomendas recentes
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              Últimas 5 operações
            </p>
          </div>
          <Link
            href="/encomendas"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Ver catálogo completo
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recentOrders ?? []).map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-950">
                    #{shortId(order.id)}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {Array.isArray(order.profiles)
                      ? (order.profiles as unknown as { full_name: string | null; display_name: string | null }[])[0]?.full_name ||
                        (order.profiles as unknown as { full_name: string | null; display_name: string | null }[])[0]?.display_name ||
                        "Cliente sem nome"
                      : (order.profiles as unknown as { full_name: string | null; display_name: string | null })?.full_name ||
                        (order.profiles as unknown as { full_name: string | null; display_name: string | null })?.display_name ||
                        "Cliente sem nome"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
              {!recentOrders?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhuma operação registada no momento.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </PageCanvas>
  );
}
