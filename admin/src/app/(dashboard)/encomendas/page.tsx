import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { getOrders } from "@/lib/actions/orders";

type OrdersPageProps = {
  searchParams?: Promise<{
    estado?: string;
  }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = (await searchParams) ?? {};
  const orders = await getOrders(params.estado);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Encomendas
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">
          Gestão de encomendas
        </h1>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <select
          name="estado"
          defaultValue={params.estado ?? "all"}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 sm:w-72"
        >
          <option value="all">Todas</option>
          <option value="pending">Pendentes</option>
          <option value="delivering">Em entrega</option>
          <option value="delivered">Entregues</option>
          <option value="refused">Recusadas</option>
        </select>
        <button
          type="submit"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Filtrar
        </button>
      </form>

      {orders.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Itens</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Acções</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
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
                    {order.order_items?.length ?? 0}
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
                  <td className="px-5 py-4">
                    <Link
                      href={`/encomendas/${order.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Ver detalhe
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Nenhuma encomenda encontrada"
          description="Ainda não existem encomendas com este filtro."
        />
      )}
    </div>
  );
}
