import type { OrderRecord } from "@/lib/types";

export type OrderStatusConfig = {
  value: OrderRecord["status"];
  label: string;
  colorClass: string;
};

export const ORDER_STATUSES: OrderStatusConfig[] = [
  {
    value: "pending",
    label: "Pendente",
    colorClass: "bg-brand-gold/10 text-brand-gold",
  },
  {
    value: "confirmed",
    label: "Confirmada",
    colorClass: "bg-brand-midnight/10 text-brand-midnight",
  },
  {
    value: "out_for_delivery",
    label: "Em entrega",
    colorClass: "bg-brand-gold/20 text-brand-gold",
  },
  {
    value: "delivered",
    label: "Entregue",
    colorClass: "bg-emerald-50 text-emerald-700", // Keep emerald for success but more muted
  },
  {
    value: "cancelled",
    label: "Cancelada",
    colorClass: "bg-brand-midnight/5 text-brand-midnight/40",
  },
  {
    value: "refused",
    label: "Recusada",
    colorClass: "bg-red-50 text-red-700", // Keep red for error but more muted
  },
] as const;

export const ORDER_STATUS_MAP = ORDER_STATUSES.reduce(
  (acc, status) => {
    acc[status.value] = status;
    return acc;
  },
  {} as Record<OrderRecord["status"], OrderStatusConfig>,
);
