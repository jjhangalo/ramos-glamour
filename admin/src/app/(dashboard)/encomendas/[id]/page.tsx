import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderContextualActions } from "@/components/orders/OrderContextualActions";
import { StatusBadge } from "@/components/ui/status-badge";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Encomendas
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Encomenda #{shortId(order.id)}
          </h1>
        </div>
        <Link
          href="/encomendas"
          className="inline-flex rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Voltar às encomendas
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_360px]">
        <section className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-950">
                Dados da encomenda
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Cliente
                </dt>
                <dd className="mt-1 text-sm text-slate-900">{customerName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Data
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatDate(order.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Total
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatPrice(order.total)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Notas
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {order.notes || "Sem notas do cliente"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Morada de entrega
            </h2>
            <div className="mt-4 space-y-1 text-sm text-slate-700">
              <p>{order.addresses?.label || "Sem etiqueta"}</p>
              <p>{order.addresses?.recipient_name || "Sem destinatário"}</p>
              <p>{order.addresses?.phone || "Sem telefone"}</p>
              <p>
                {[order.addresses?.street, order.addresses?.neighborhood]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>
                {[order.addresses?.city, order.addresses?.province]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{order.addresses?.reference || "Sem ponto de referência"}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Itens</h2>
            <div className="mt-4 space-y-4">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-slate-950">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {[item.variant_size, item.variant_color]
                          .filter(Boolean)
                          .join(" · ") || "Sem variação"}
                      </p>
                    </div>
                    <div className="text-sm text-slate-700">
                      {item.quantity} × {formatPrice(item.product_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Acções</h2>
            <div className="mt-4">
              <OrderContextualActions orderId={order.id} status={order.status} />
            </div>
            {whatsappUrl && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  className="inline-flex w-full justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Contactar via WhatsApp
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Informação</h2>
            <div className="mt-4 space-y-4">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Canal de Venda</dt>
                <dd className="text-sm font-medium text-slate-900">Loja Online</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Método de Pagamento</dt>
                <dd className="text-sm font-medium text-slate-900">Pagamento na Entrega / Transferência</dd>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
