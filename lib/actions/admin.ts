"use server";

import { z } from "zod";

import { auth } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/brevo";
import { db, hasDatabase } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente de paiement",
  PAID: "Paiement confirmé",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;
  return session;
}

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  note: z.string().trim().max(300).optional(),
});

export type AdminActionResult = { ok: boolean; message: string };

export async function updateOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
  note?: string;
}): Promise<AdminActionResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: "Accès administrateur requis." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Statut ou note invalide." };
  }

  if (!hasDatabase) {
    return {
      ok: true,
      message: `Statut passé à « ${STATUS_LABELS[parsed.data.status]} » (démonstration, non persisté).`,
    };
  }

  try {
    const order = await db.order.update({
      where: { id: parsed.data.orderId },
      data: {
        status: parsed.data.status,
        statusHistory: {
          create: { status: parsed.data.status, note: parsed.data.note },
        },
      },
      include: { user: true },
    });

    const email = order.user?.email ?? order.guestEmail;
    if (email) {
      await sendOrderStatusEmail({
        to: email,
        name: order.user?.name ?? "Client DESCO",
        orderNumber: order.orderNumber,
        statusLabel: STATUS_LABELS[parsed.data.status],
      });
    }

    return { ok: true, message: `Statut mis à jour : ${STATUS_LABELS[parsed.data.status]}.` };
  } catch (error) {
    console.error("[admin] Mise à jour du statut impossible", error);
    return { ok: false, message: "Impossible de mettre à jour cette commande." };
  }
}

const settingsSchema = z.object({
  shopName: z.string().trim().min(2, "Nom de boutique requis."),
  shopEmail: z.string().trim().email("Email invalide."),
  shopPhone: z.string().trim().min(6, "Téléphone requis."),
  shopAddress: z.string().trim().min(5, "Adresse requise."),
});

export async function saveSettings(input: z.infer<typeof settingsSchema>): Promise<AdminActionResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: "Accès administrateur requis." };

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Paramètres invalides." };
  }

  if (!hasDatabase) {
    return {
      ok: true,
      message: "Paramètres validés. Connectez Neon pour les enregistrer durablement.",
    };
  }

  try {
    const entries = [
      ["shop.name", parsed.data.shopName],
      ["shop.email", parsed.data.shopEmail],
      ["shop.phone", parsed.data.shopPhone],
      ["shop.address", parsed.data.shopAddress],
    ] as const;

    await Promise.all(
      entries.map(([key, value]) =>
        db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    return { ok: true, message: "Paramètres enregistrés." };
  } catch (error) {
    console.error("[admin] Enregistrement des paramètres impossible", error);
    return { ok: false, message: "Impossible d'enregistrer les paramètres." };
  }
}

const productInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3, "Nom trop court."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug requis.")
    .regex(/^[a-z0-9-]+$/, "Slug invalide."),
  description: z.string().trim().min(30, "Description trop courte (30 caractères minimum)."),
  priceXaf: z.coerce.number().int().min(100, "Prix invalide."),
  comparePriceXaf: z.coerce.number().int().min(0).optional(),
  categorySlug: z.string().min(2, "Catégorie requise."),
  stock: z.coerce.number().int().min(0),
  sizes: z.array(z.string().min(1)).min(1, "Ajoutez au moins une taille."),
  imageUrl: z.string().trim().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  metaTitle: z.string().trim().max(70).optional(),
  metaDesc: z.string().trim().max(160).optional(),
});

export type AdminProductInput = z.infer<typeof productInputSchema>;

export async function saveProduct(input: AdminProductInput): Promise<AdminActionResult & { productId?: string }> {
  const session = await requireAdmin();
  if (!session) return { ok: false, message: "Accès administrateur requis." };

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
    };
  }

  if (!hasDatabase) {
    return {
      ok: true,
      message: parsed.data.id
        ? "Produit mis à jour (démonstration, non persisté)."
        : "Produit enregistré (démonstration, non persisté).",
    };
  }

  try {
    const category = await db.category.findUnique({
      where: { slug: parsed.data.categorySlug },
    });
    if (!category) {
      return { ok: false, message: "Catégorie introuvable. Créez-la d'abord." };
    }

    const price = Math.round(parsed.data.priceXaf * 100);
    const comparePrice =
      parsed.data.comparePriceXaf && parsed.data.comparePriceXaf > parsed.data.priceXaf
        ? Math.round(parsed.data.comparePriceXaf * 100)
        : null;

    if (parsed.data.id) {
      const updated = await db.product.update({
        where: { id: parsed.data.id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description,
          price,
          comparePrice,
          categoryId: category.id,
          isActive: parsed.data.isActive,
          isFeatured: parsed.data.isFeatured,
          isNew: parsed.data.isNew,
          metaTitle: parsed.data.metaTitle,
          metaDesc: parsed.data.metaDesc,
        },
      });

      if (parsed.data.imageUrl) {
        const firstImage = await db.productImage.findFirst({
          where: { productId: updated.id },
          orderBy: { position: "asc" },
        });
        if (firstImage) {
          await db.productImage.update({
            where: { id: firstImage.id },
            data: { url: parsed.data.imageUrl },
          });
        } else {
          await db.productImage.create({
            data: { productId: updated.id, url: parsed.data.imageUrl, alt: updated.name, position: 0 },
          });
        }
      }

      return { ok: true, message: "Produit mis à jour.", productId: updated.id };
    }

    const created = await db.product.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        price,
        comparePrice,
        categoryId: category.id,
        isActive: parsed.data.isActive,
        isFeatured: parsed.data.isFeatured,
        isNew: parsed.data.isNew,
        metaTitle: parsed.data.metaTitle,
        metaDesc: parsed.data.metaDesc,
        images: {
          create: [
            {
              url:
                parsed.data.imageUrl && parsed.data.imageUrl.length > 0
                  ? parsed.data.imageUrl
                  : "/products/photo-1523381210434-271e8be1f52b.jpg",
              alt: parsed.data.name,
              position: 0,
            },
          ],
        },
        variants: {
          create: parsed.data.sizes.map((size, index) => ({
            size,
            color: "Noir",
            colorHex: "#111111",
            sku: `${parsed.data.slug}-${size}-${index}`.toLowerCase(),
            stock: Math.max(
              0,
              Math.floor(parsed.data.stock / parsed.data.sizes.length)
            ),
          })),
        },
      },
    });

    return { ok: true, message: "Produit créé.", productId: created.id };
  } catch (error) {
    console.error("[admin] Enregistrement produit impossible", error);
    return {
      ok: false,
      message: "Enregistrement impossible. Vérifiez que le slug est unique.",
    };
  }
}
