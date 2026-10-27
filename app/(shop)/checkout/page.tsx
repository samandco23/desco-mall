import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Paiement",
  robots: { index: false },
};

export default function CheckoutPage() {
  const demoMode = !process.env.FAPSHI_API_KEY;
  return <CheckoutView demoMode={demoMode} />;
}
