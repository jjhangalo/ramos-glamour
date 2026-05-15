import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/format";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const statusStyles = {
  pending: "bg-brand-bg text-brand-charcoal",
  processing: "bg-brand-gold/10 text-brand-gold",
  delivering: "bg-blue-100 text-blue-900",
  delivered: "bg-green-100 text-green-900",
  refused: "bg-red-100 text-red-900",
} as const;

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  delivering: "Out for Delivery",
  delivered: "Delivered",
  refused: "Refused",
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
        title="My Orders"
        description="Track the status of your orders and review your items quickly."
      />

      <div className="space-y-5">
        {(orders ?? []).map((order) => (
          <article
            key={order.id}
            className="rounded-[1.75rem] bg-white/90 p-6 shadow-[0_16px_35px_rgba(98,98,96,0.08)] border border-brand-midnight/5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Order #{order.id.slice(0, 8)}
                </p>
                <p className="mt-2 text-xs font-medium text-brand-midnight/60">
                  {dateFormatter.format(new Date(order.created_at))}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[order.status as keyof typeof statusStyles] ?? statusStyles.pending}`}
              >
                {statusLabels[order.status as keyof typeof statusLabels] ?? "Pending"}
              </span>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Total
                </p>
                <p className="mt-2 text-lg font-light text-brand-midnight">
                  {formatPrice(Number(order.total ?? 0))}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Address
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-brand-midnight/60 uppercase tracking-wider">
                  {order.addresses?.label ?? "Address"}
                  <br />
                  {order.addresses?.city ?? "Undefined city"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
                  Items
                </p>
                <ul className="mt-2 space-y-2 text-[11px] font-medium text-brand-midnight/70">
                  {(order.order_items ?? []).map(
                    (item: { id: string; product_name: string; quantity: number }) => (
                      <li key={item.id} className="truncate">
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
          <section className="rounded-[1.75rem] bg-white/30 px-6 py-16 text-center border border-dashed border-brand-midnight/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-midnight/30">
              No orders found.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
