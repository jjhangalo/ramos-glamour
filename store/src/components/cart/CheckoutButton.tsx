"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { processCheckout } from "@/lib/actions/checkout";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  items: {
    id: string;
    variantId?: string;
    variantSize?: string;
    variantColor?: string;
    quantity: number;
  }[];
  addressId: string | null;
  label?: string;
  className?: string;
};

export function CheckoutButton({ 
  items, 
  addressId, 
  label = "FINALIZAR COMPRA", 
  className 
}: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCheckout = () => {
    if (!addressId) {
      toast.error("Por favor, selecione uma morada de entrega.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await processCheckout(items, addressId);
        if (result.success) {
          toast.success("Encomenda efetuada com sucesso!");
          router.push(`/checkout/confirmacao?order=${result.orderId}`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao processar o checkout.");
      }
    });
  };

  const isDisabled = items.length === 0 || !addressId || isPending;

  return (
    <button
      onClick={handleCheckout}
      disabled={isDisabled}
      className={cn(
        "w-full py-5 text-[11px] font-bold tracking-[0.3em] transition-all duration-500 touch-manipulation",
        !isDisabled 
          ? "bg-brand-gold text-brand-white hover:bg-brand-midnight shadow-xl" 
          : "bg-brand-midnight/10 text-brand-midnight/40 cursor-not-allowed",
        className
      )}
    >
      {isPending ? "A PROCESSAR..." : label}
    </button>
  );
}
