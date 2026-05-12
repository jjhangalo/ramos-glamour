"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";

export function CartHeaderButton({ useWhite }: { useWhite?: boolean }) {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <Link
      href="/carrinho"
      aria-label="Carrinho de compras"
      className={cn(
        "relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300",
        useWhite ? "hover:bg-white/10" : "hover:bg-brand-midnight/5"
      )}
    >
      <ShoppingBag 
        className={cn(
          "h-6 w-6 transition-colors",
          useWhite ? "text-brand-white" : "text-brand-midnight"
        )} 
        strokeWidth={1.5} 
      />
      {totalItems > 0 && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[9px] font-bold text-white shadow-md ring-2 ring-brand-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
