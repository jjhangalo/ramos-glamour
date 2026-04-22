"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Product } from "@/lib/actions/products";

export type CartItem = {
  id: string; // Product database ID
  itemKey: string; // Unique identifier for product + variant combination
  name: string; // Base product name
  displayName: string; // Product name + variant details (e.g. "Name — Color, Size")
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantSize?: string;
  variantColor?: string;
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (
    product: Product,
    quantity: number,
    variant?: { id: string; size?: string | null; color?: string | null; price_override?: number | null },
    variantImage?: string
  ) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
};

type PersistedCartState = Pick<CartState, "items" | "totalItems" | "totalPrice">;

function getTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}

function buildCartItem(
  product: Product,
  quantity: number,
  variant?: { id: string; size?: string | null; color?: string | null; price_override?: number | null },
  variantImage?: string
): CartItem {
  const itemKey = variant ? `${product.id}__${variant.id}` : product.id;
  
  // Build dynamic display name
  const attributes = [variant?.color, variant?.size].filter(Boolean);
  const displayName = attributes.length > 0 
    ? `${product.name} — ${attributes.join(", ")}`
    : product.name;

  return {
    id: product.id,
    itemKey,
    name: product.name,
    displayName,
    price: variant?.price_override ?? product.price,
    image: variantImage || product.images[0]?.url || "",
    quantity,
    variantId: variant?.id,
    variantSize: variant?.size ?? undefined,
    variantColor: variant?.color ?? undefined,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      addItem: (product, quantity, variant, variantImage) => {
        const safeQuantity = Math.max(1, quantity);

        set((state) => {
          const itemKey = variant ? `${product.id}__${variant.id}` : product.id;
          const existingItem = state.items.find((item) => item.itemKey === itemKey);

          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map((item) => 
              item.itemKey === itemKey 
                ? { ...item, quantity: item.quantity + safeQuantity }
                : item
            );
          } else {
            newItems = [...state.items, buildCartItem(product, safeQuantity, variant, variantImage)];
          }

          return {
            items: newItems,
            ...getTotals(newItems),
          };
        });
      },
      removeItem: (itemKey) => {
        set((state) => {
          const items = state.items.filter((item) => item.itemKey !== itemKey);

          return {
            items,
            ...getTotals(items),
          };
        });
      },
      updateQuantity: (itemKey, quantity) => {
        const safeQuantity = Math.max(1, quantity);

        set((state) => {
          const items = state.items.map((item) =>
            item.itemKey === itemKey ? { ...item, quantity: safeQuantity } : item,
          );

          return {
            items,
            ...getTotals(items),
          };
        });
      },
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },
    }),
    {
      name: "ramos-glamour-cart",
      partialize: (state): PersistedCartState => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    },
  ),
);
