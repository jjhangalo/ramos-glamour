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
    colorClass: "bg-blue-50 text-blue-600",
  },
  {
    value: "out_for_delivery",
    label: "Em entrega",
    colorClass: "bg-indigo-50 text-indigo-600",
  },
  {
    value: "delivered",
    label: "Entregue",
    colorClass: "bg-emerald-50 text-emerald-600",
  },
  {
    value: "cancelled",
    label: "Cancelada",
    colorClass: "bg-brand-midnight/5 text-brand-midnight/40",
  },
  {
    value: "refused",
    label: "Recusada",
    colorClass: "bg-red-50 text-red-600",
  },
] as const;

export const ORDER_STATUS_MAP = ORDER_STATUSES.reduce(
  (acc, status) => {
    acc[status.value] = status;
    return acc;
  },
  {} as Record<OrderRecord["status"], OrderStatusConfig>,
);
