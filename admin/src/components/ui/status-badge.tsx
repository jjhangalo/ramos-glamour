import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: "pending" | "delivering" | "delivered" | "refused";
};

const statusMap: Record<
  StatusBadgeProps["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-800",
  },
  delivering: {
    label: "Em entrega",
    className: "bg-blue-100 text-blue-800",
  },
  delivered: {
    label: "Entregue",
    className: "bg-emerald-100 text-emerald-800",
  },
  refused: {
    label: "Recusada",
    className: "bg-red-100 text-red-800",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status];

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
