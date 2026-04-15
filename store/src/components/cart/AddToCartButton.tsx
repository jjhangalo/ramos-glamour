"use client";

import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

import type { PublicProduct } from "@/lib/actions/public-products";
import { useCartStore } from "@/lib/store/cart";

type AddToCartButtonProps = {
  product: PublicProduct;
  quantity?: number;
  className?: string;
  compact?: boolean;
};

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  compact = false,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        addItem(product, quantity);
        toast.success("Produto adicionado ao carrinho");
      }}
      className={className}
    >
      <ShoppingBag className={compact ? "h-4 w-4" : "h-5 w-5"} />
      <span>Adicionar ao carrinho</span>
    </button>
  );
}
