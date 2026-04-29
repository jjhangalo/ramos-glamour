import Link from "next/link";
import { Eye } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { getOrders } from "@/lib/actions/orders";
import { OrderGlobalSearch } from "@/components/orders/OrderGlobalSearch";
import { OrderListClient } from "@/components/orders/OrderListClient";
import { PageCanvas } from "@/components/ui/page-canvas";

type OrdersPageProps = {
  searchParams?: Promise<{
    estado?: string;
    search?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = (await searchParams) ?? {};
  const orders = await getOrders(params.estado, params.search);

  return (
    <PageCanvas size="list" className="space-y-8 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Operações
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Encomendas
          </h1>
        </div>
        
        <OrderGlobalSearch />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { label: "Todas", value: "all" },
          { label: "Pendentes", value: "pending" },
          { label: "Confirmadas", value: "confirmed" },
          { label: "Em entrega", value: "out_for_delivery" },
          { label: "Entregues", value: "delivered" },
          { label: "Canceladas", value: "cancelled" },
        ].map((tab) => {
          const isActive = (params.estado || "all") === tab.value;
          return (
            <Link
              key={tab.value}
              href={{
                query: { ...params, estado: tab.value },
              }}
              className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length ? (
        <OrderListClient initialOrders={orders} />
      ) : (
        <EmptyState
          title="Nenhuma encomenda encontrada"
          description={params.search ? `Não encontramos resultados para "${params.search}"` : "Ainda não existem encomendas com este filtro."}
        />
      )}
    </PageCanvas>
  );
}
