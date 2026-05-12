"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { CheckCircle, Truck, Ban, Loader2, Info } from "lucide-react";

import { updateOrdersBulk } from "@/lib/actions/orders";
import type { OrderRecord } from "@/lib/types";

type OrderBulkBarProps = {
  selectedIds: string[];
  selectedOrders: Pick<OrderRecord, "id" | "status">[];
  onComplete: () => void;
};

export function OrderBulkBar({
  selectedIds,
  selectedOrders,
  onComplete,
}: OrderBulkBarProps) {
  const [isPending, startTransition] = useTransition();

  const handleBulkUpdate = (status: OrderRecord["status"]) => {
    startTransition(async () => {
      const result = await updateOrdersBulk(selectedIds, status);
      if (result.success) {
        toast.success(`Acção concluída para ${selectedIds.length} encomendas.`);
        onComplete();
      } else {
        toast.error(result.error ?? "Erro ao processar em massa.");
      }
    });
  };

  if (selectedIds.length === 0) return null;

  const statuses = new Set(selectedOrders.map((o) => o.status));
  const isMixed = statuses.size > 1;
  const currentStatus = isMixed ? null : Array.from(statuses)[0];

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-950 bg-slate-900 p-4 shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold">
            {selectedIds.length}
          </div>
          <p className="text-sm font-medium">selecionadas</p>
        </div>

        {isMixed ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Info className="h-3.5 w-3.5" />
            Estados mistos. Filtre por estado para acções.
          </div>
        ) : (
          <div className="flex gap-2">
            {currentStatus === "pending" && (
              <button
                disabled={isPending}
                onClick={() => handleBulkUpdate("delivering")}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-slate-100 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
                DESPACHAR
              </button>
            )}

            {currentStatus === "pending" && (
              <button
                disabled={isPending}
                onClick={() => {
                  if (confirm(`Cancelar ${selectedIds.length} encomendas?`)) {
                    handleBulkUpdate("refused");
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-red-600/20 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-600/30 disabled:opacity-50"
              >
                <Ban className="h-3 w-3" />
                CANCELAR
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
