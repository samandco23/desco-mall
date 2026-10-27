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

    if (payload.status === "SUCCESSFUL") {
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
      }

      await db.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "PAID",
          statusHistory: {
            create: { status: "PAID", note: "Paiement Mobile Money confirmé par Fapshi" },
          },
        },
      });

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
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
            statusHistory: {
              create: { status: "CANCELLED", note: "Paiement Mobile Money échoué" },
            },
          },
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
