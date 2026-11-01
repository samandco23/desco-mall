const KPAY_API = "https://admin.kpay.site/api/v1";

export const isKpayConfigured = Boolean(process.env.KPAY_API_KEY && process.env.KPAY_SECRET_KEY && process.env.KPAY_WEBHOOK_SECRET);

export type KpayPaymentResponse = { id: string; reference: string; status: string; gatewayUrl?: string; externalId: string };

export function verifyKpayWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.KPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const supplied = signature.trim().replace(/^sha256=/i, "");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(supplied, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function initiateKpayPayment(input: { amount: number; externalId: string; provider: "MTN_MOMO_CMR" | "ORANGE_CMR"; phoneNumber: string; customerName: string; customerEmail: string; description: string }): Promise<KpayPaymentResponse> {
  if (!isKpayConfigured) throw new Error("KPay n'est pas configuré.");
  const digits = input.phoneNumber.replace(/\D/g, "").replace(/^0/, "");
  const phoneNumber = digits.startsWith("237") ? digits : `237${digits}`;
  const response = await fetch(`${KPAY_API}/payments/init`, {
    method: "POST", cache: "no-store",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.KPAY_API_KEY!, "X-Secret-Key": process.env.KPAY_SECRET_KEY! },
    body: JSON.stringify({ amount: input.amount, currency: "XAF", provider: input.provider, phoneNumber, externalId: input.externalId, description: input.description, customerName: input.customerName, customerEmail: input.customerEmail }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || typeof result.id !== "string" || typeof result.reference !== "string") {
    throw new Error("KPay n'a pas pu initialiser le paiement.");
  }
  return result as KpayPaymentResponse;
}
import { createHmac, timingSafeEqual } from "node:crypto";

