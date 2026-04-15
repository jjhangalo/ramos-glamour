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
      className="inline-flex items-center gap-2 rounded-full border border-brand-charcoal/10 bg-brand-bg/50 px-3 py-2 text-sm font-medium text-brand-charcoal transition hover:bg-brand-bg md:px-4"
    >
      <span className="relative inline-flex items-center">
        <ShoppingBag className="h-4 w-4" />
        {totalItems > 0 ? (
          <span className="absolute -right-3 -top-3 rounded-full bg-brand-olive px-2 py-0.5 text-[10px] font-semibold text-brand-white">
            {totalItems}
          </span>
        ) : null}
      </span>
      <span className="hidden md:inline">Carrinho</span>
    </Link>
  );
}
