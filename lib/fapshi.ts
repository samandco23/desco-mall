import { createHmac, timingSafeEqual } from "node:crypto";

const FAPSHI_BASE = process.env.FAPSHI_BASE_URL ?? "https://sandbox.fapshi.com";

export const isFapshiConfigured = Boolean(
  process.env.FAPSHI_API_USER && process.env.FAPSHI_API_KEY
);

function fapshiHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    apiuser: process.env.FAPSHI_API_USER ?? "",
    apikey: process.env.FAPSHI_API_KEY ?? "",
  };
}

export interface FapshiPaymentInit {
  /** Montant en XAF entier (pas en centimes). */
  amount: number;
  email: string;
  redirectUrl?: string;
  message?: string;
  userId?: string;
}

export interface FapshiPaymentResponse {
  message: string;
  link: string;
  transferCode: string;
}

export interface FapshiWebhookPayload {
  transferCode: string;
  status: "SUCCESSFUL" | "FAILED" | "PENDING";
  amount: number;
  userId?: string;
  payerPhone?: string;
  type?: string;
}

export async function initiateFapshiPayment(
  data: FapshiPaymentInit
): Promise<FapshiPaymentResponse> {
  if (!isFapshiConfigured) {
    throw new Error("Fapshi n'est pas configuré.");
  }

  const response = await fetch(`${FAPSHI_BASE}/initiate-pay`, {
    method: "POST",
    headers: fapshiHeaders(),
    body: JSON.stringify({
      amount: Math.round(data.amount),
      email: data.email,
      redirectUrl:
        data.redirectUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmation`,
      message: data.message ?? "Commande DESCO MALL",
      userId: data.userId,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error: unknown = await response.json().catch(() => null);
    const detail =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : response.statusText;
    throw new Error(`Fapshi : ${detail}`);
  }

  return (await response.json()) as FapshiPaymentResponse;
}

export async function getFapshiPaymentStatus(transferCode: string) {
  if (!isFapshiConfigured) {
    throw new Error("Fapshi n'est pas configuré.");
  }

  const response = await fetch(`${FAPSHI_BASE}/payment-status/${transferCode}`, {
    method: "GET",
    headers: fapshiHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Fapshi : impossible de vérifier le paiement.");
  }

  return (await response.json()) as FapshiWebhookPayload;
}

export function verifyFapshiWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.FAPSHI_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const provided = signature.replace(/^sha256=/, "").trim();

  try {
    const a = Buffer.from(provided, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
