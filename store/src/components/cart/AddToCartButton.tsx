"use client";

"use client";

import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

import type { Product } from "@/lib/actions/products";
import { useCartStore } from "@/lib/store/cart";
import { trackAddToCart } from "@/lib/analytics";
import { useUIFeedback } from "@/hooks/use-audio";

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
  variant?: { id: string; size?: string | null; color?: string | null; price_override?: number | null };
  variantImage?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  label?: string;
  onAdd?: () => void;
};

export function AddToCartButton({
  product,
  quantity = 1,
  variant,
  variantImage,
  className,
  compact = false,
  disabled = false,
  label,
  onAdd,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { playSuccess } = useUIFeedback();

  return (
    <button
      type="button"
      aria-label="Adicionar ao carrinho"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) return;
        addItem(product, quantity, variant, variantImage);
        trackAddToCart({
          id: product.id,
          name: product.name,
          price: variant?.price_override || product.promo_price || product.price,
          category: product.categories?.[0]?.name,
          variant: variant ? `${variant.size || ""}-${variant.color || ""}` : undefined,
        }, quantity);
        playSuccess();
        toast.success("Produto adicionado ao carrinho");
        onAdd?.();
      }}
      className={className}
    >
      <ShoppingBag className={compact ? "h-4 w-4" : "h-5 w-5"} />
      <span className="hidden md:inline">{label || "Adicionar ao carrinho"}</span>
    </button>
  );
}
