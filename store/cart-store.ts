"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItem } from "@/lib/types";
import { unitPriceFor } from "@/lib/wholesale";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

function itemKey(item: { productId: string; size: string; color: string }) {
  return `${item.productId}-${item.size}-${item.color}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        const key = itemKey(item);
        const existing = get().items.find((entry) => entry.key === key);
        if (existing) {
          set({
            items: get().items.map((entry) =>
              entry.key === key
                ? {
                    ...entry,
                    quantity: Math.min(
                      entry.quantity + item.quantity,
                      entry.maxQuantity
                    ),
                  }
                : entry
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, key }] });
        }
        set({ isOpen: true });
      },
      removeItem: (key) =>
        set({ items: get().items.filter((item) => item.key !== key) }),
      updateQuantity: (key, quantity) =>
        set({
          items: get().items.map((item) =>
            item.key === key
              ? {
                  ...item,
                  quantity: Math.max(1, Math.min(quantity, item.maxQuantity)),
                }
              : item
          ),
        }),
      clear: () =>
        set({ items: [], isOpen: false }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "desco-cart",
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + unitPriceFor(item.price, item.quantity) * item.quantity,
    0
  );
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
