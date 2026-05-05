"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";

import { updateOrderStatus } from "@/lib/actions/orders";
import type { OrderRecord } from "@/lib/types";

type OrderStatusSelectProps = {
  orderId: string;
  value: OrderRecord["status"];
};

import { CustomSelect } from "@/components/ui/custom-select";

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
    <CustomSelect
      value={value}
      disabled={isPending}
      onChange={(val) =>
        startTransition(async () => {
          if (!val) return;
          const result = await updateOrderStatus(
            orderId,
            val as OrderRecord["status"],
          );

          if (!result.success) {
            toast.error(result.error ?? "Não foi possível actualizar o estado.");
            return;
          }

          toast.success("Estado da encomenda actualizado.");
        })
      }
      options={options.map(opt => ({ value: opt.value, label: opt.label }))}
    />
  );
}
