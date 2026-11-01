import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { auth } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";

export const metadata: Metadata = {
  title: "Paiement",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  const user = hasDatabase && session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id }, include: { addresses: { where: { isDefault: true }, take: 1 } } })
    : null;
  const address = user?.addresses[0];
  return <CheckoutView defaults={{
    fullName: user?.name ?? session?.user?.name ?? "",
    email: user?.email ?? session?.user?.email ?? "",
    phone: user?.phone ?? "",
    city: address?.city ?? "Douala",
    neighborhood: address?.neighborhood ?? "",
    instructions: address?.instructions ?? "",
    paymentMethod: user?.preferredPaymentMethod === "ORANGE_MONEY" ? "ORANGE_MONEY" : "MTN_MOMO",
  }} />;
}
