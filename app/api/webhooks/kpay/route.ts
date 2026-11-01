import { NextResponse } from "next/server";

import { sendOrderConfirmationEmail } from "@/lib/brevo";
import { db, hasDatabase } from "@/lib/db";
import { verifyKpayWebhookSignature } from "@/lib/kpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type KpayEvent = { event: string; paymentId: string; reference: string; status: string; amount: number; externalId: string };

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyKpayWebhookSignature(rawBody, request.headers.get("x-kpay-signature") ?? "")) {
    return NextResponse.json({ message: "Signature invalide." }, { status: 401 });
  }
  if (!hasDatabase) return NextResponse.json({ message: "Service indisponible." }, { status: 503 });
  let event: KpayEvent;
  try { event = JSON.parse(rawBody) as KpayEvent; } catch { return NextResponse.json({ message: "JSON invalide." }, { status: 400 }); }
  const validStatus = event.event === "payment.completed" ? event.status === "COMPLETED" : event.event === "payment.failed" ? event.status === "FAILED" : event.event === "payment.cancelled" && event.status === "CANCELLED";
  if (!event.externalId || !event.paymentId || !Number.isInteger(event.amount) || event.amount < 0 || !validStatus) {
    return NextResponse.json({ message: "Événement invalide." }, { status: 400 });
  }
  try {
    const order = await db.order.findFirst({ where: { orderNumber: event.externalId, paymentProvider: "KPAY" }, include: { items: true, user: true } });
    if (!order) return NextResponse.json({ received: true }, { status: 200 });
    if (order.kpayPaymentId && order.kpayPaymentId !== event.paymentId) return NextResponse.json({ received: true }, { status: 200 });
    if (event.event === "payment.completed") {
      if (event.amount !== Math.round(order.total / 100)) return NextResponse.json({ message: "Montant invalide." }, { status: 400 });
      const changed = await db.$transaction(async (tx) => {
        const result = await tx.order.updateMany({ where: { id: order.id, paymentStatus: { in: ["UNPAID", "PENDING_CONFIRMATION"] } }, data: { status: "PAID", paymentStatus: "PAID" } });
        if (result.count) {
          await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "PAID", note: "Paiement confirmé par KPay" } });
          for (const item of order.items) await tx.product.update({ where: { id: item.productId }, data: { soldCount: { increment: item.quantity } } });
        }
        return result.count;
      });
      if (changed) {
        const email = order.user?.email ?? order.guestEmail;
        if (email) await sendOrderConfirmationEmail({ to: email, name: order.user?.name ?? "Client DESCO", orderNumber: order.orderNumber, total: order.total, items: order.items.map((item) => ({ name: item.productName, quantity: item.quantity, price: item.unitPrice })) });
      }
    } else if (order.paymentStatus !== "PAID" && order.paymentStatus !== "FAILED") {
      await db.$transaction(async (tx) => {
        const changed = await tx.order.updateMany({ where: { id: order.id, paymentStatus: { in: ["UNPAID", "PENDING_CONFIRMATION"] } }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
        if (!changed.count) return;
        for (const item of order.items) if (item.variantId) await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "CANCELLED", note: "Paiement KPay échoué ou annulé; stock restitué" } });
      });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[kpay] Traitement webhook impossible", error);
    return NextResponse.json({ message: "Erreur de traitement." }, { status: 500 });
  }
}
