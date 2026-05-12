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
    value: "delivering",
    label: "Em entrega",
    colorClass: "bg-brand-gold/20 text-brand-gold",
  },
  {
    value: "delivered",
    label: "Entregue",
    colorClass: "bg-emerald-50 text-emerald-700",
  },
  {
    value: "refused",
    label: "Recusada / Cancelada",
    colorClass: "bg-red-50 text-red-700",
  },
] as const;

export const ORDER_STATUS_MAP = ORDER_STATUSES.reduce(
  (acc, status) => {
    acc[status.value] = status;
    return acc;
  },
  {} as Record<OrderRecord["status"], OrderStatusConfig>,
);
