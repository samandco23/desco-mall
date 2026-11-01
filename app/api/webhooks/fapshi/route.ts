import { NextResponse } from "next/server";

import { sendOrderConfirmationEmail } from "@/lib/brevo";
import { db, hasDatabase } from "@/lib/db";
import { verifyFapshiWebhookSignature, type FapshiWebhookPayload } from "@/lib/fapshi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fapshi notifie les paiements Mobile Money.
 * - Signature HMAC-SHA256 obligatoire (header x-fapshi-signature).
 * - Toujours répondre 200 après traitement pour éviter les retries infinis,
 *   sauf signature invalide (401).
 * - Le stock est réservé au moment de la commande : le webhook ne le décrémente
 *   pas une seconde fois, il ne le restaure qu'en cas d'échec.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-fapshi-signature") ??
    request.headers.get("x-signature") ??
    "";

  if (!process.env.FAPSHI_WEBHOOK_SECRET) {
    console.error("[fapshi] FAPSHI_WEBHOOK_SECRET absent : webhook ignoré.");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!verifyFapshiWebhookSignature(rawBody, signature)) {
    console.error("[fapshi] Signature invalide.");
    return NextResponse.json({ message: "Signature invalide." }, { status: 401 });
  }

  let payload: FapshiWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as FapshiWebhookPayload;
  } catch {
    console.error("[fapshi] Payload JSON invalide.");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ received: true, demo: true }, { status: 200 });
  }

  try {
    if (!payload.transferCode || !["SUCCESSFUL", "FAILED", "PENDING"].includes(payload.status) || !Number.isInteger(payload.amount) || payload.amount < 0) {
      return NextResponse.json({ message: "Payload invalide." }, { status: 400 });
    }
    const order = await db.order.findFirst({
      where: {
        OR: [
          { fapshiPaymentId: payload.transferCode },
          ...(payload.userId ? [{ id: payload.userId }] : []),
        ],
      },
      include: { items: true, user: true },
    });

    if (!order) {
      console.error(`[fapshi] Commande introuvable pour ${payload.transferCode}.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Never accept a success event for a different amount than the order total.
    if (payload.status === "SUCCESSFUL" && payload.amount !== Math.round(order.total / 100)) {
      console.error(`[fapshi] Montant incohérent pour ${order.orderNumber}.`);
      return NextResponse.json({ message: "Montant invalide." }, { status: 400 });
    }

    if (payload.status === "SUCCESSFUL") {
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
      }

      const changed = await db.$transaction(async (tx) => {
        const result = await tx.order.updateMany({ where: { id: order.id, paymentStatus: { in: ["UNPAID", "PENDING_CONFIRMATION"] } }, data: { status: "PAID", paymentStatus: "PAID" } });
        if (result.count) {
          await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "PAID", note: "Paiement Mobile Money confirmé par Fapshi" } });
          for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { soldCount: { increment: item.quantity } } });
        }
        return result.count;
      });
      if (!changed) return NextResponse.json({ received: true, duplicate: true }, { status: 200 });

      const email = order.user?.email ?? order.guestEmail;
      if (email) {
        await sendOrderConfirmationEmail({
          to: email,
          name: order.user?.name ?? "Client DESCO",
          orderNumber: order.orderNumber,
          total: order.total,
          items: order.items.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
          })),
        });
      }
    } else if (payload.status === "FAILED") {
      if (order.paymentStatus === "PAID" || order.paymentStatus === "FAILED") {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      await db.$transaction(async (tx) => {
        const changed = await tx.order.updateMany({ where: { id: order.id, paymentStatus: { in: ["UNPAID", "PENDING_CONFIRMATION"] } }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
        if (!changed.count) return;
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        await tx.orderStatusHistory.create({
          data: { orderId: order.id, status: "CANCELLED", note: "Paiement Mobile Money échoué; stock restitué" },
        });
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[fapshi] Traitement du webhook impossible", error);
    // On répond 200 : Fapshi réessaiera inutilement sinon. L'erreur est loguée.
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
