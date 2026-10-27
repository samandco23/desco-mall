"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistEntry = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
};

type WishlistState = {
  items: WishlistEntry[];
  toggle: (entry: WishlistEntry) => void;
  remove: (id: string) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (entry) => {
        const exists = get().items.some((item) => item.id === entry.id);
        set({
          items: exists
            ? get().items.filter((item) => item.id !== entry.id)
            : [...get().items, entry],
        });
      },
      remove: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
    }),
    { name: "desco-wishlist" }
  )
);
