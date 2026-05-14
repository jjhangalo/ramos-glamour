import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageCanvas } from "@/components/ui/page-canvas";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/shared/Animations";
import { getDashboardMetrics } from "@/lib/actions/dashboard";

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [
    metricsData,
    { data: recentOrders },
  ] = await Promise.all([
    getDashboardMetrics(),
    supabase
      .from("orders")
      .select(
        "id, total, status, created_at, profiles(full_name, display_name)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const metrics = [
    { label: "Clientes activos", value: metricsData.clientsCount },
    { label: "Receita Total", value: formatPrice(metricsData.totalRevenue) },
    { label: "Encomendas pendentes", value: metricsData.pendingOrdersCount },
    { label: "Falhas Logísticas", value: metricsData.failuresCount },
  ];

  return (
    <PageCanvas size="list" className="space-y-8 py-8">
      <FadeUp>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-midnight/40">
            Administração
          </p>
          <h1 className="heading-luxury mt-2 text-4xl font-light text-brand-midnight">
            Visão Geral
          </h1>
        </div>
      </FadeUp>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StaggerItem
            key={metric.label}
            className="rounded-xl border border-brand-midnight/5 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">{metric.label}</p>
            <p className="mt-3 text-3xl font-light text-brand-midnight tracking-tight">
              {metric.value}
            </p>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeUp delay={0.4}>
        <section className="rounded-xl border border-brand-midnight/5 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between bg-brand-bg/50 border-b border-brand-midnight/5 px-6 py-4">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/40">
                Encomendas recentes
              </h2>
              <p className="mt-1 text-sm font-semibold text-brand-midnight">
                Últimas 5 operações
              </p>
            </div>
            <Link
              href="/encomendas"
              className="rounded-md border border-brand-midnight/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/70 shadow-sm transition hover:bg-brand-bg"
            >
              VER CATÁLOGO COMPLETO
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-brand-bg/30 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-midnight/40">
                <tr className="border-b border-brand-midnight/5">
                  <th className="px-6 py-3 font-semibold">ID</th>
                  <th className="px-6 py-3 font-semibold">Cliente</th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                  <th className="px-6 py-3 font-semibold">Data</th>
                </tr>
              </thead>
              <StaggerContainer as="tbody" className="divide-y divide-brand-midnight/5">
                {(recentOrders ?? []).map((order) => (
                  <StaggerItem as="tr" key={order.id} className="transition-colors hover:bg-brand-bg/40">
                    <td className="px-6 py-4 font-bold text-brand-midnight">
                      #{shortId(order.id)}
                    </td>
                    <td className="px-6 py-4 text-brand-midnight/70">
                      {Array.isArray(order.profiles)
                        ? (order.profiles as unknown as { full_name: string | null; display_name: string | null }[])[0]?.full_name ||
                          (order.profiles as unknown as { full_name: string | null; display_name: string | null }[])[0]?.display_name ||
                          "Cliente sem nome"
                        : (order.profiles as unknown as { full_name: string | null; display_name: string | null })?.full_name ||
                          (order.profiles as unknown as { full_name: string | null; display_name: string | null })?.display_name ||
                          "Cliente sem nome"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-midnight">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-brand-midnight/40 font-medium">
                      {formatDate(order.created_at)}
                    </td>
                  </StaggerItem>
                ))}
                {!recentOrders?.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      Nenhuma operação registada no momento.
                    </td>
                  </tr>
                ) : null}
              </StaggerContainer>
            </table>
          </div>
        </section>
      </FadeUp>
    </PageCanvas>
  );
}
