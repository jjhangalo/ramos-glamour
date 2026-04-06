"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";

import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderRecord } from "@/lib/types";

type OrderStatusSelectProps = {
  orderId: string;
  value: OrderRecord["status"];
};

const options = [
  { value: "pending", label: "Pendente" },
  { value: "delivering", label: "Em entrega" },
  { value: "delivered", label: "Entregue" },
  { value: "refused", label: "Recusada" },
] as const;

export function OrderStatusSelect({
  orderId,
  value,
}: OrderStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={isPending}
      onChange={(event) =>
        startTransition(async () => {
          const result = await updateOrderStatus(
            orderId,
            event.target.value as OrderRecord["status"],
          );

          if (!result.success) {
            toast.error(result.error ?? "Não foi possível actualizar o estado.");
            return;
          }

          toast.success("Estado da encomenda actualizado.");
        })
      }
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
