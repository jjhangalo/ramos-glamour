import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";

const dateFormatter = new Intl.DateTimeFormat("pt-AO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const statusStyles = {
  pending: "bg-brand-bg text-brand-charcoal",
  delivering: "bg-blue-100 text-blue-900",
  delivered: "bg-green-100 text-green-900",
  refused: "bg-red-100 text-red-900",
} as const;

const statusLabels = {
  pending: "Pendente",
  delivering: "Em entrega",
  delivered: "Entregue",
  refused: "Recusada",
} as const;

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*), addresses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <ProfileSectionHeader
        title="As minhas encomendas"
        description="Acompanhe o estado das suas encomendas e reveja os itens rapidamente."
      />

      <div className="space-y-5">
        {(orders ?? []).map((order) => (
          <article
            key={order.id}
            className="rounded-[1.75rem] bg-white/90 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-brand-charcoal/60">
                  Encomenda #{order.id.slice(0, 8)}
                </p>
                <p className="mt-2 text-sm text-brand-charcoal/70">
                  {dateFormatter.format(new Date(order.created_at))}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status as keyof typeof statusStyles] ?? statusStyles.pending}`}
              >
                {statusLabels[order.status as keyof typeof statusLabels] ?? "Pendente"}
              </span>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-charcoal/55">
                  Total
                </p>
                <p className="mt-2 text-xl font-semibold text-brand-charcoal">
                  {formatPrice(Number(order.total ?? 0))}
                </p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-charcoal/55">
                  Morada
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-charcoal/75">
                  {order.addresses?.label ?? "Morada"}
                  {" · "}
                  {order.addresses?.city ?? "Cidade não definida"}
                </p>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-brand-charcoal/55">
                  Itens
                </p>
                <ul className="mt-2 space-y-2 text-sm text-brand-charcoal/75">
                  {(order.order_items ?? []).map(
                    (item: { id: string; product_name: string; quantity: number }) => (
                      <li key={item.id}>
                        {item.product_name} × {item.quantity}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </article>
        ))}

        {orders?.length ? null : (
          <section className="rounded-[1.75rem] bg-white/90 px-6 py-16 text-center shadow-[0_16px_35px_rgba(98,98,96,0.08)]">
            <p className="text-brand-charcoal/75">
              Ainda não tem encomendas.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
