import Link from "next/link";
import { Eye } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { getOrders } from "@/lib/actions/orders";
import { OrderGlobalSearch } from "@/components/orders/OrderGlobalSearch";
import { OrderListClient } from "@/components/orders/OrderListClient";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Operações
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Encomendas
          </h1>
        </div>
        
        <OrderGlobalSearch />
      </div>

      <div className="flex flex-wrap items-center gap-3">
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
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
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
    </div>
  );
}
