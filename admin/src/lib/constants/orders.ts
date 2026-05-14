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
    colorClass: "bg-blue-50 text-blue-700",
  },
  {
    value: "delivered",
    label: "Entregue",
    colorClass: "bg-emerald-50 text-emerald-700",
  },
  {
    value: "delivery_failed",
    label: "Falha na entrega",
    colorClass: "bg-orange-50 text-orange-700",
  },
  {
    value: "refused",
    label: "Recusada",
    colorClass: "bg-red-50 text-red-700",
  },
  {
    value: "cancelled_by_admin",
    label: "Cancelada pela loja",
    colorClass: "bg-gray-100 text-gray-700",
  },
  {
    value: "cancelled_by_customer",
    label: "Cancelada pelo cliente",
    colorClass: "bg-gray-50 text-gray-600",
  },
] as const;

export const ORDER_STATUS_MAP = ORDER_STATUSES.reduce(
  (acc, status) => {
    acc[status.value] = status;
    return acc;
  },
  {} as Record<OrderRecord["status"], OrderStatusConfig>,
);
