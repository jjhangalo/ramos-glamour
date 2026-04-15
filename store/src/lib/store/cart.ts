"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PublicProduct } from "@/lib/actions/public-products";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: PublicProduct, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

type PersistedCartState = Pick<CartState, "items" | "totalItems" | "totalPrice">;

function getTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}

function buildCartItem(product: PublicProduct, quantity: number): CartItem {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0]?.url ?? "",
    quantity,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      addItem: (product, quantity) => {
        const safeQuantity = Math.max(1, quantity);

        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          const items = existingItem
            ? state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + safeQuantity }
                  : item,
              )
            : [...state.items, buildCartItem(product, safeQuantity)];

          return {
            items,
            ...getTotals(items),
          };
        });
      },
      removeItem: (productId) => {
        set((state) => {
          const items = state.items.filter((item) => item.id !== productId);

          return {
            items,
            ...getTotals(items),
          };
        });
      },
      updateQuantity: (productId, quantity) => {
        const safeQuantity = Math.max(1, quantity);

        set((state) => {
          const items = state.items.map((item) =>
            item.id === productId ? { ...item, quantity: safeQuantity } : item,
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
