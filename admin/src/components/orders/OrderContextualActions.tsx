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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actions: Record<string, { label: string; icon: any; target: OrderRecord["status"]; color: string }> = {
    pending: {
      label: "Confirmar Encomenda",
      icon: CheckCircle,
      target: "confirmed",
      color: "bg-brand-midnight hover:bg-brand-midnight/90 text-white",
    },
    confirmed: {
      label: "Despachar para Entrega",
      icon: Truck,
      target: "out_for_delivery",
      color: "bg-brand-midnight hover:bg-brand-midnight/90 text-white",
    },
    out_for_delivery: {
      label: "Marcar como Entregue",
      icon: CheckCircle,
      target: "delivered",
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
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
            "flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50",
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
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-midnight/5 bg-white px-4 py-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Ban className="h-4 w-4" />
            Cancelar
          </button>
        )}

        {status === "out_for_delivery" && (
          <button
            disabled={isPending}
            onClick={() => handleUpdate("refused")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-midnight/5 bg-white px-4 py-3 text-xs font-bold text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Recusada
          </button>
        )}
      </div>
    </div>
  );
}
