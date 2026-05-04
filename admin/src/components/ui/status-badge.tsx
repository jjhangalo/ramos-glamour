import { cn } from "@/lib/utils";
import type { OrderRecord } from "@/lib/types";

type StatusBadgeProps = {
  status: OrderRecord["status"];
};

const statusMap: Record<
  OrderRecord["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className: "bg-brand-gold/10 text-brand-gold",
  },
  confirmed: {
    label: "Confirmada",
    className: "bg-blue-50 text-blue-600",
  },
  out_for_delivery: {
    label: "Em entrega",
    className: "bg-indigo-50 text-indigo-600",
  },
  delivered: {
    label: "Entregue",
    className: "bg-emerald-50 text-emerald-600",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-brand-midnight/5 text-brand-midnight/40",
  },
  refused: {
    label: "Recusada",
    className: "bg-red-50 text-red-600",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
