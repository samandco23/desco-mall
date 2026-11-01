"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import { db, hasDatabase } from "@/lib/db";
import { findDemoOrder, saveDemoOrder } from "@/lib/demo-order-store";
import {
  initiateFapshiPayment,
  isFapshiConfigured,
  type FapshiPaymentResponse,
} from "@/lib/fapshi";
import { rateLimit } from "@/lib/redis";
import type { DemoOrder, OrderStatus } from "@/lib/types";
import { shippingFeeFor } from "@/lib/utils";
import { unitPriceFor } from "@/lib/wholesale";
import {
  checkoutSchema,
  type CheckoutInput,
  type CheckoutResult,
} from "@/lib/validations/order";

function orderNumberFor(year: number): string {
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `DM-${year}-${random}`;
}

function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    PENDING: "En attente de paiement",
    PAID: "Paiement confirmé",
    PROCESSING: "En préparation",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
    REFUNDED: "Remboursée",
  };
  return labels[status];
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez les informations de livraison.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const requestHeaders = headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "local";

  const allowed = await rateLimit(`ratelimit:checkout:${ip}`, 10, 60);
  if (!allowed) {
    return {
      ok: false,
      message: "Trop de tentatives. Patientez une minute avant de réessayer.",
    };
  }

  const catalogue = await getProducts();
  const byId = new Map(catalogue.map((product) => [product.id, product]));

  const lines = parsed.data.items.map((line) => {
    const product = byId.get(line.productId);
    if (!product) {
      throw new Error(`Produit introuvable : ${line.name}`);
    }
    if (!product.sizes.includes(line.size)) {
      throw new Error(`Taille indisponible pour ${product.name}.`);
    }
    const available = product.stock[line.size] ?? 0;
    if (available < line.quantity) {
      throw new Error(
        `Stock insuffisant pour ${product.name} (${line.size}). Il reste ${available} pièce(s).`
      );
    }
    return { product, line };
  });

  const subtotal = lines.reduce(
    (sum, { product, line }) =>
      sum + unitPriceFor(product.price, line.quantity) * line.quantity,
    0
  );
  const shippingFee = shippingFeeFor(parsed.data.city);
  const total = subtotal + shippingFee;
  const year = new Date().getFullYear();
  const orderNumber = orderNumberFor(year);
  const session = await auth();
  const now = new Date().toISOString();

  const unavailable = lines.find(({ product, line }) => {
    const available = product.stock[line.size] ?? 0;
    return available < line.quantity;
  });
  if (unavailable) {
    return { ok: false, message: "Un article de votre panier n'est plus disponible." };
  }

  if (!hasDatabase) {
    const demoOrder: DemoOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerName: parsed.data.fullName,
      customerEmail: parsed.data.email,
      customerPhone: parsed.data.phone,
      city: parsed.data.city,
      neighborhood: parsed.data.neighborhood,
      status: "PAID",
      paymentStatus: "PAID",
      paymentMethod: parsed.data.paymentMethod,
      total,
      shippingFee,
      items: lines.map(({ product, line }) => ({
        productName: product.name,
        variantInfo: `Taille: ${line.size}, Couleur: ${line.color}`,
        imageUrl: product.images[0]?.url,
        quantity: line.quantity,
        unitPrice: unitPriceFor(product.price, line.quantity),
      })),
      createdAt: now,
      timeline: [
        { status: "PENDING", note: "Commande créée", at: now },
        {
          status: "PAID",
          note: `Paiement ${parsed.data.paymentMethod === "MTN_MOMO" ? "MTN MoMo" : "Orange Money"} simulé (démo)`,
          at: now,
        },
      ],
    };
    saveDemoOrder(demoOrder);
    return { ok: true, orderNumber };
  }

  try {
    const order = await db.$transaction(async (tx) => {
      const reserved: { productId: string; variantId: string; quantity: number; product: typeof lines[number]["product"]; line: typeof lines[number]["line"] }[] = [];
      for (const { product, line } of lines) {
        const variant = await tx.productVariant.findFirst({
          where: { productId: product.id, size: line.size, color: line.color },
        });
        if (!variant) throw new Error(`Variante introuvable pour ${product.name}.`);
        const changed = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (changed.count !== 1) throw new Error(`Stock insuffisant pour ${product.name}.`);
        reserved.push({ productId: product.id, variantId: variant.id, quantity: line.quantity, product, line });
      }
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          guestEmail: session?.user?.id ? null : parsed.data.email,
          guestPhone: session?.user?.id ? null : parsed.data.phone,
          status: "PENDING",
          paymentStatus: "UNPAID",
          paymentMethod: parsed.data.paymentMethod,
          subtotal,
          shippingFee,
          total,
          shippingCity: parsed.data.city,
          notes: parsed.data.instructions,
          items: { create: reserved.map(({ product, line, variantId }) => ({
            productId: product.id, variantId, productName: product.name,
            variantInfo: `Taille: ${line.size}, Couleur: ${line.color}`,
            imageUrl: product.images[0]?.url, quantity: line.quantity,
            unitPrice: unitPriceFor(product.price, line.quantity),
            total: unitPriceFor(product.price, line.quantity) * line.quantity,
          })) },
          statusHistory: {
            create: { status: "PENDING", note: "Commande créée" },
          },
        },
      });

      return created;
    });

    if (!isFapshiConfigured) {
      await db.$transaction(async (tx) => {
        const canceled = await tx.order.updateMany({ where: { id: order.id, paymentStatus: "UNPAID" }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
        if (canceled.count) {
          const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
          for (const item of items) if (item.variantId) {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          }
          await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "CANCELLED", note: "Paiement non configuré; stock restitué" } });
        }
      });
      return { ok: false, message: "Le paiement n'est pas configuré. Aucun stock n'a été réservé durablement." };
    }

    let payment: FapshiPaymentResponse | null = null;
    try {
      payment = await initiateFapshiPayment({
        amount: Math.round(total / 100),
        email: parsed.data.email,
        message: `Commande ${order.orderNumber} — DESCO MALL`,
        userId: order.id,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmation?order=${order.orderNumber}`,
      });
    } catch (error) {
      console.error("[checkout] Échec initialisation Fapshi", error);
    }

    if (!payment) {
      await db.$transaction(async (tx) => {
        const canceled = await tx.order.updateMany({ where: { id: order.id, paymentStatus: "UNPAID" }, data: { status: "CANCELLED", paymentStatus: "FAILED" } });
        if (canceled.count) {
          const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
          for (const item of items) if (item.variantId) {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          }
          await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "CANCELLED", note: "Paiement indisponible; stock restitué" } });
        }
      });
      return {
        ok: false,
        message:
          "Le paiement Mobile Money est momentanément indisponible. Réessayez dans quelques instants.",
      };
    }

    await db.order.update({
      where: { id: order.id },
      data: {
        fapshiPaymentId: payment.transferCode,
        fapshiPayUrl: payment.link,
        paymentStatus: "PENDING_CONFIRMATION",
        statusHistory: {
          create: {
            status: "PENDING",
            note: "Redirection vers Fapshi",
          },
        },
      },
    });

    return { ok: true, orderNumber: order.orderNumber, redirectUrl: payment.link };
  } catch (error) {
    console.error("[checkout] Création de commande impossible", error);
    return {
      ok: false,
      message:
        "Impossible d'enregistrer votre commande pour le moment. Aucun montant n'a été débité.",
    };
  }
}

export async function getOrderForConfirmation(orderNumber: string): Promise<DemoOrder | null> {
  return findDemoOrder(orderNumber) ?? null;
}

export { statusLabel };
