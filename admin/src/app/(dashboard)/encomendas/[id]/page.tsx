import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderContextualActions } from "@/components/orders/OrderContextualActions";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageCanvas } from "@/components/ui/page-canvas";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { getOrder, getOrderWhatsappLink } from "@/lib/actions/orders";

type OrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) {
    notFound();
  }

  const whatsappUrl = await getOrderWhatsappLink(id);
  const customerName =
    order.profiles?.full_name ||
    order.profiles?.display_name ||
    "Cliente sem nome";

  return (
    <PageCanvas size="list" className="space-y-8 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Encomendas
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Encomenda #{shortId(order.id)}
          </h1>
        </div>
        <Link
          href="/encomendas"
          className="inline-flex rounded-md border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50 shadow-sm"
        >
          Voltar
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Dados da encomenda
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <dl className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cliente
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{customerName}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Data
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(order.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total
                </dt>
                <dd className="mt-1 text-lg font-bold text-slate-950">
                  {formatPrice(order.total)}
                </dd>
              </div>
              <div className="md:col-span-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Notas
                </dt>
                <dd className="mt-1 text-sm text-slate-600">
                  {order.notes || "Sem notas do cliente"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-3">
              Morada de entrega
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-sm text-slate-700">
                <p className="font-bold text-slate-900">{order.addresses?.recipient_name || "Sem destinatário"}</p>
                <p className="text-xs text-slate-500">{order.addresses?.phone || "Sem telefone"}</p>
                <p className="mt-2">
                  {[order.addresses?.street, order.addresses?.neighborhood]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>
                  {[order.addresses?.city, order.addresses?.province]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[9px] mb-1">Referência / Notas</p>
                <p>{order.addresses?.reference || "Nenhum ponto de referência fornecido."}</p>
                <p className="mt-2 italic opacity-60">Etiqueta: {order.addresses?.label || "Padrão"}</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-6 py-4 border-b border-slate-100 bg-slate-50">
              Itens da encomenda
            </h2>
            <div className="divide-y divide-slate-100">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-4 transition-colors hover:bg-slate-50/50"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-slate-950">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {[item.variant_size, item.variant_color]
                          .filter(Boolean)
                          .join(" · ") || "Opção única"}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      <span className="text-xs text-slate-400 font-normal">{item.quantity} × </span>
                      {formatPrice(item.product_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-3">
              Acções de Operação
            </h2>
            <div className="mt-4">
              <OrderContextualActions orderId={order.id} status={order.status} />
            </div>
            {whatsappUrl && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  className="inline-flex w-full justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Contactar via WhatsApp
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-3">
              Logística & Pagamento
            </h2>
            <div className="space-y-4">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Canal de Venda</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">Loja Online (Direct)</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Método de Pagamento</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">Pagamento na Entrega</dd>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </PageCanvas>
  );
}
