"use client";

import { useCartStore, cartCount, cartSubtotal } from "@/store/cart-store";

export function useCart() {
  return useCartStore();
}

export function useCartCount(): number {
  return useCartStore((state) => cartCount(state.items));
}

export function useCartSubtotal(): number {
  return useCartStore((state) => cartSubtotal(state.items));
}
