"use server";

import { headers } from "next/headers";
import { randomBytes } from "node:crypto";

import { auth } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import { db, hasDatabase } from "@/lib/db";
import {
  initiateFapshiPayment,
  isFapshiConfigured,
  type FapshiPaymentResponse,
} from "@/lib/fapshi";
import { initiateKpayPayment, isKpayConfigured } from "@/lib/kpay";
import { rateLimit } from "@/lib/redis";
import { getPublicBaseUrl } from "@/lib/site-url";
import type { OrderRecord, OrderStatus } from "@/lib/types";
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
  const confirmationToken = randomBytes(32).toString("hex");
  const session = await auth();

  const unavailable = lines.find(({ product, line }) => {
    const available = product.stock[line.size] ?? 0;
    return available < line.quantity;
  });
  if (unavailable) {
    return { ok: false, message: "Un article de votre panier n'est plus disponible." };
  }

  if (!hasDatabase) return { ok: false, message: "Le service de commande est momentanément indisponible." };

  try {
    const configuredProvider = hasDatabase ? await db.setting.findUnique({ where: { key: "payment.provider" } }) : null;
    const paymentProvider = configuredProvider?.value === "KPAY" ? "KPAY" : "FAPSHI";
    if (paymentProvider === "KPAY" ? !isKpayConfigured : !isFapshiConfigured) {
      return { ok: false, message: `Le paiement ${paymentProvider === "KPAY" ? "KPay" : "Fapshi"} n'est pas configuré.` };
    }
    const order = await db.$transaction(async (tx) => {
      let addressId: string | undefined;
      if (session?.user?.id) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { name: parsed.data.fullName, phone: parsed.data.phone, preferredPaymentMethod: parsed.data.paymentMethod },
        });
        const address = await tx.address.findFirst({ where: { userId: session.user.id, isDefault: true } });
        const addressData = {
          fullName: parsed.data.fullName, phone: parsed.data.phone, city: parsed.data.city,
          neighborhood: parsed.data.neighborhood, instructions: parsed.data.instructions || null,
          label: "Domicile", isDefault: true,
        };
        if (address) {
          const saved = await tx.address.update({ where: { id: address.id }, data: addressData });
          addressId = saved.id;
        } else {
          const saved = await tx.address.create({ data: { userId: session.user.id, ...addressData } });
          addressId = saved.id;
        }
      }
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
          confirmationToken,
          userId: session?.user?.id ?? null,
          addressId,
          guestEmail: session?.user?.id ? null : parsed.data.email,
          guestPhone: parsed.data.phone,
          status: "PENDING",
          paymentStatus: "UNPAID",
          paymentMethod: parsed.data.paymentMethod,
          paymentProvider,
          subtotal,
          shippingFee,
          total,
          shippingCity: parsed.data.city,
          shippingNeighborhood: parsed.data.neighborhood,
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

    let payment: { id: string; reference: string; redirectUrl?: string } | null = null;
    try {
      const returnUrl = `${getPublicBaseUrl(requestHeaders)}/checkout/confirmation?order=${encodeURIComponent(order.orderNumber)}&token=${confirmationToken}`;
      if (paymentProvider === "KPAY") {
        const kpay = await initiateKpayPayment({ amount: Math.round(total / 100), externalId: order.orderNumber, provider: parsed.data.paymentMethod === "ORANGE_MONEY" ? "ORANGE_CMR" : "MTN_MOMO_CMR", phoneNumber: parsed.data.phone, customerName: parsed.data.fullName, customerEmail: parsed.data.email, description: `Commande ${order.orderNumber} — DESCO MALL` });
        payment = { id: kpay.id, reference: kpay.reference };
      } else {
        const fapshi: FapshiPaymentResponse = await initiateFapshiPayment({ amount: Math.round(total / 100), email: parsed.data.email, message: `Commande ${order.orderNumber} — DESCO MALL`, userId: order.id, redirectUrl: returnUrl });
        payment = { id: fapshi.transferCode, reference: fapshi.transferCode, redirectUrl: fapshi.link };
      }
    } catch (error) {
      console.error(`[checkout] Échec initialisation ${paymentProvider}`, error);
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
        ...(paymentProvider === "KPAY" ? { kpayPaymentId: payment.id, kpayReference: payment.reference } : { fapshiPaymentId: payment.id, fapshiPayUrl: payment.redirectUrl }),
      },
    });
    await db.$transaction(async (tx) => {
      const updated = await tx.order.updateMany({ where: { id: order.id, paymentStatus: "UNPAID" }, data: { paymentStatus: "PENDING_CONFIRMATION" } });
      if (updated.count) await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "PENDING", note: paymentProvider === "KPAY" ? "Demande Mobile Money envoyée" : "Redirection vers Fapshi" } });
    });

    return { ok: true, orderNumber: order.orderNumber, confirmationToken, redirectUrl: payment.redirectUrl };
  } catch (error) {
    console.error("[checkout] Création de commande impossible", error);
    return {
      ok: false,
      message:
        "Impossible d'enregistrer votre commande pour le moment. Aucun montant n'a été débité.",
    };
  }
}

export async function getOrderForConfirmation(orderNumber: string, confirmationToken?: string): Promise<OrderRecord | null> {
  if (!hasDatabase) return null;
  const session = await auth();
  if (!session?.user?.id && !confirmationToken) return null;
  const order = await db.order.findFirst({
    where: { orderNumber, ...(confirmationToken ? { confirmationToken } : { userId: session!.user!.id }) },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return null;
  return {
    id: order.id, orderNumber: order.orderNumber,
    customerName: session?.user?.name ?? "Client DESCO", customerEmail: order.guestEmail ?? session?.user?.email ?? "",
    customerPhone: order.guestPhone ?? "", city: order.shippingCity ?? "", neighborhood: order.shippingNeighborhood ?? "",
    status: order.status, paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod === "ORANGE_MONEY" ? "ORANGE_MONEY" : "MTN_MOMO",
    total: order.total, shippingFee: order.shippingFee, createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({ productName: item.productName, variantInfo: item.variantInfo ?? undefined, imageUrl: item.imageUrl ?? undefined, quantity: item.quantity, unitPrice: item.unitPrice })),
    timeline: order.statusHistory.map((entry) => ({ status: entry.status, note: entry.note ?? undefined, at: entry.createdAt.toISOString() })),
  };
}

export { statusLabel };
