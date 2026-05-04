import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { getOrders } from "@/lib/actions/orders";
import { OrderGlobalSearch } from "@/components/orders/OrderGlobalSearch";
import { OrderListClient } from "@/components/orders/OrderListClient";
import { OrderPaginationWrapper } from "@/components/orders/OrderPaginationWrapper";
import { PageCanvas } from "@/components/ui/page-canvas";
import { PageHeader } from "@/components/list/PageHeader";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/Animations";
import { cn } from "@/lib/utils";

type OrdersPageProps = {
  searchParams?: Promise<{
    estado?: string;
    search?: string;
    pagina?: string;
    limite?: string;
  }>;
};

const STATUS_TABS = [
  { label: "Todas", value: "all" },
  { label: "Pendentes", value: "pending" },
  { label: "Confirmadas", value: "confirmed" },
  { label: "Em entrega", value: "out_for_delivery" },
  { label: "Entregues", value: "delivered" },
  { label: "Canceladas", value: "cancelled" },
];

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = Number(params.pagina || "1");
  const pageSize = Number(params.limite || "20");

  const { orders, count } = await getOrders(
    params.estado,
    params.search,
    currentPage,
    pageSize,
  );

  const totalPages = Math.ceil(count / pageSize);
  const currentStatus = params.estado || "all";

  return (
    <PageCanvas size="list" className="relative space-y-8 pb-32 pt-8">
      {/* Header */}
      <FadeUp>
        <PageHeader
          title="Encomendas"
          actions={<OrderGlobalSearch />}
        />
      </FadeUp>

      {/* Status Filter Tabs */}
      <FadeUp delay={0.05}>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => {
            const isActive = currentStatus === tab.value;
            return (
              <Link
                key={tab.value}
                href={{
                  query: { ...params, estado: tab.value, pagina: "1" },
                }}
                className={cn(
                  "rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all",
                  isActive
                    ? "bg-brand-midnight text-brand-white shadow-md shadow-brand-midnight/20"
                    : "border border-brand-midnight/10 bg-white text-brand-midnight/50 hover:border-brand-midnight/30 hover:text-brand-midnight"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </FadeUp>

      {/* Results summary */}
      {count > 0 && (
        <FadeUp delay={0.1}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
            {count} encomenda{count !== 1 ? "s" : ""} encontrada{count !== 1 ? "s" : ""}
            {params.search && ` para "${params.search}"`}
          </p>
        </FadeUp>
      )}

      {/* Order List */}
      {orders.length ? (
        <StaggerContainer className="space-y-4">
          <StaggerItem>
            <OrderListClient initialOrders={orders} />
          </StaggerItem>

          <StaggerItem>
            <OrderPaginationWrapper
              totalCount={count}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
            />
          </StaggerItem>
        </StaggerContainer>
      ) : (
        <FadeUp delay={0.15}>
          <EmptyState
            title="Nenhuma encomenda encontrada"
            description={
              params.search
                ? `Não encontramos resultados para "${params.search}"`
                : "Ainda não existem encomendas com este filtro."
            }
          />
        </FadeUp>
      )}
    </PageCanvas>
  );
}
