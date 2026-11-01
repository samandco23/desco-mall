"use client";

import { useEffect } from "react";

import { getOrderForConfirmation } from "@/lib/actions/checkout";
import { useCartStore } from "@/store/cart-store";

export function ClearCartOnMount({ enabled, orderNumber, confirmationToken }: { enabled: boolean; orderNumber?: string; confirmationToken?: string }) {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    if (enabled) { clear(); return; }
    if (!orderNumber) return;
    let active = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      attempts += 1;
      const order = await getOrderForConfirmation(orderNumber, confirmationToken).catch(() => null);
      if (!active) return;
      if (order?.paymentStatus === "PAID") clear();
      if (attempts < 120 && (order?.paymentStatus === "PENDING_CONFIRMATION" || order?.paymentStatus === "UNPAID")) timer = setTimeout(check, 5000);
    };
    timer = setTimeout(check, 3000);
    return () => { active = false; clearTimeout(timer); };
  }, [clear, enabled, orderNumber, confirmationToken]);

  return null;
}
