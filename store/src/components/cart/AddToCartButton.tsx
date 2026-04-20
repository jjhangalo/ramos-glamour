"use client";

"use client";

import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

import type { Product } from "@/lib/actions/products";
import { useCartStore } from "@/lib/store/cart";

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
  variant?: { id: string; size?: string | null; color?: string | null; price_override?: number | null };
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  onAdd?: () => void;
};

export function AddToCartButton({
  product,
  quantity = 1,
  variant,
  className,
  compact = false,
  disabled = false,
  onAdd,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      type="button"
      aria-label="Adicionar ao carrinho"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) return;
        addItem(product, quantity, variant);
        toast.success("Produto adicionado ao carrinho");
        onAdd?.();
      }}
      className={className}
    >
      <ShoppingBag className={compact ? "h-4 w-4" : "h-5 w-5"} />
      <span className="hidden md:inline">Adicionar ao carrinho</span>
    </button>
  );
}
