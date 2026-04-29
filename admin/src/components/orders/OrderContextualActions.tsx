"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { CheckCircle, Truck, Package, XCircle, Ban } from "lucide-react";

import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type OrderContextualActionsProps = {
  orderId: string;
  status: OrderRecord["status"];
};

export function OrderContextualActions({
  orderId,
  status,
}: OrderContextualActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newStatus: OrderRecord["status"]) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao actualizar estado.");
      } else {
        toast.success("Estado actualizado com sucesso.");
      }
    });
  };

  const terminalStates = ["delivered", "cancelled", "refused"];
  if (terminalStates.includes(status)) {
    return null;
  }

  // Primary Action Mapping
  const actions: Record<string, { label: string; icon: any; target: OrderRecord["status"]; color: string }> = {
    pending: {
      label: "Confirmar Encomenda",
      icon: CheckCircle,
      target: "confirmed",
      color: "bg-slate-950 hover:bg-slate-800 text-white",
    },
    confirmed: {
      label: "Despachar para Entrega",
      icon: Truck,
      target: "out_for_delivery",
      color: "bg-slate-950 hover:bg-slate-800 text-white",
    },
    out_for_delivery: {
      label: "Marcar como Entregue",
      icon: Package,
      target: "delivered",
      color: "bg-green-600 hover:bg-green-700 text-white",
    },
  };

  const primaryAction = actions[status];

  return (
    <div className="flex flex-col gap-3">
      {primaryAction && (
        <button
          disabled={isPending}
          onClick={() => handleUpdate(primaryAction.target)}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
            primaryAction.color
          )}
        >
          <primaryAction.icon className="h-5 w-5" />
          {isPending ? "A processar..." : primaryAction.label}
        </button>
      )}

      <div className="flex gap-2">
        {(status === "pending" || status === "confirmed") && (
          <button
            disabled={isPending}
            onClick={() => handleUpdate("cancelled")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Ban className="h-3.5 w-3.5" />
            Cancelar
          </button>
        )}

        {status === "out_for_delivery" && (
          <button
            disabled={isPending}
            onClick={() => handleUpdate("refused")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-orange-600 transition hover:bg-orange-50 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Recusada
          </button>
        )}
      </div>
    </div>
  );
}
