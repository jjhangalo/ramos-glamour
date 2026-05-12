"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { processCheckout, type CartItem } from "@/lib/actions/checkout";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  items: CartItem[];
  addressId: string | null;
  notes?: string;
  label?: string;
  className?: string;
};

export function CheckoutButton({
  items,
  addressId,
  notes,
  label = "FINALIZAR COMPRA",
  className,
}: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);

  const isDisabled = items.length === 0 || !addressId || isPending;

  const handleCheckout = () => {
    if (!addressId) {
      toast.error("Por favor, selecione uma morada de entrega.");
      return;
    }

    if (items.length === 0) {
      toast.error("O seu carrinho está vazio.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await processCheckout(items, addressId, notes);

        if (result.success) {
          // Only clear cart after confirmed server success
          clearCart();
          toast.success("Encomenda efetuada com sucesso!");
          router.push(`/checkout/confirmacao?order=${result.orderId}`);
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Falha ao processar a encomenda. Tente novamente.",
        );
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={isDisabled}
      aria-busy={isPending}
      className={cn(
        "w-full py-5 text-[11px] font-bold tracking-[0.3em] transition-all duration-500 touch-manipulation",
        !isDisabled
          ? "bg-brand-gold text-brand-white hover:bg-brand-midnight shadow-xl"
          : "bg-brand-midnight/10 text-brand-midnight/40 cursor-not-allowed",
        className,
      )}
    >
      {isPending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          A PROCESSAR...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
