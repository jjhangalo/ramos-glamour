import { cn } from "@/lib/utils";
import type { OrderRecord } from "@/lib/types";

type StatusBadgeProps = {
  status: OrderRecord["status"];
};

import { ORDER_STATUS_MAP } from "@/lib/constants/orders";

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = ORDER_STATUS_MAP[status] ?? { label: status, colorClass: "bg-slate-100 text-slate-600" };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        config.colorClass,
      )}
    >
      {config.label}
    </span>
  );
}
