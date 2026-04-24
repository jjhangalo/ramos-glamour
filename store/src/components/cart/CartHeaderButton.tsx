"use client";

import Link from "next/link";

import { ShoppingBag } from "lucide-react";

import { useCartStore } from "@/lib/store/cart";

export function CartHeaderButton() {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <Link
      href="/carrinho"
      aria-label="Carrinho de compras"
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
    >
      <ShoppingBag className="h-5 w-5 text-brand-midnight" strokeWidth={1.5} />
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[9px] font-bold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
