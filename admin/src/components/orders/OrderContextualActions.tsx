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
  const primaryActions: Record<string, { label: string; icon: any; target: OrderRecord["status"]; color: string }> = {
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
      color: "bg-brand-gold hover:bg-brand-gold/90 text-brand-midnight",
    },
    out_for_delivery: {
      label: "Marcar como Entregue",
      icon: CheckCircle,
      target: "delivered",
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  };

  const primaryAction = primaryActions[status];

  // Secondary/Alternative Actions
  const allStatuses: OrderRecord["status"][] = [
    "pending",
    "confirmed",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refused",
  ];

  const secondaryActions = allStatuses.filter(s => 
    s !== status && // Not current
    s !== primaryAction?.target && // Not the primary next step
    !terminalStates.includes(status) // Not if already terminal
  );

  return (
    <div className="space-y-6">
      {primaryAction && (
        <button
          disabled={isPending}
          onClick={() => handleUpdate(primaryAction.target)}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold shadow-lg shadow-brand-midnight/5 transition-all active:scale-[0.98] disabled:opacity-50",
            primaryAction.color
          )}
        >
          <primaryAction.icon className="h-5 w-5" />
          {isPending ? "A processar..." : primaryAction.label}
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        {secondaryActions.map((s) => {
          const isDestructive = s === "cancelled" || s === "refused";
          return (
            <button
              key={s}
              disabled={isPending}
              onClick={() => handleUpdate(s)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-brand-midnight/5 bg-white px-3 py-3 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-brand-bg disabled:opacity-50",
                isDestructive ? "text-red-600 hover:bg-red-50" : "text-brand-midnight/60"
              )}
            >
              {s === "cancelled" && <Ban className="h-3 w-3" />}
              {s === "refused" && <XCircle className="h-3 w-3" />}
              {s === "confirmed" && <CheckCircle className="h-3 w-3" />}
              {s === "out_for_delivery" && <Truck className="h-3 w-3" />}
              {s === "delivered" && <Package className="h-3 w-3" />}
              {s === "pending" && <Package className="h-3 w-3" />}
              {s === "pending" ? "Mover para Pendente" : 
               s === "confirmed" ? "Confirmar" :
               s === "out_for_delivery" ? "Em Entrega" :
               s === "delivered" ? "Entregue" :
               s === "cancelled" ? "Cancelar" : "Recusar"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
