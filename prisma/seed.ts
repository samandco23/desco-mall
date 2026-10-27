import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { demoCategories, demoOrders, demoProducts } from "../lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? "client123";

  const admin = await prisma.user.upsert({
    where: { email: "admin@descomall.cm" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@descomall.cm",
      name: "DESCO Admin",
      phone: "+237 655 000 000",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@descomall.cm" },
    update: {},
    create: {
      email: "client@descomall.cm",
      name: "Aïcha Ngo Bell",
      phone: "+237 655 234 118",
      passwordHash: await bcrypt.hash(clientPassword, 12),
      role: "USER",
      emailVerified: new Date(),
    },
  });

  const existingAddress = await prisma.address.findFirst({
    where: { userId: client.id, label: "Domicile" },
  });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: client.id,
        label: "Domicile",
        fullName: "Aïcha Ngo Bell",
        phone: "+237 655 234 118",
        city: "Douala",
        neighborhood: "Bonapriso",
        isDefault: true,
      },
    });
  }

  const categoryIds = new Map<string, string>();
  for (const [index, category] of demoCategories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        imageUrl: category.image,
        position: index,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.image,
        position: index,
      },
    });
    categoryIds.set(category.slug, row.id);
  }

  const productIds = new Map<string, string>();
  for (const product of demoProducts) {
    const categoryId = categoryIds.get(product.category.slug);
    if (!categoryId) continue;

    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice ?? null,
        categoryId,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        soldCount: product.soldCount,
        metaTitle: `${product.name} — DESCO MALL`,
        metaDesc: product.description.slice(0, 155),
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice ?? null,
        categoryId,
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        soldCount: product.soldCount,
        metaTitle: `${product.name} — DESCO MALL`,
        metaDesc: product.description.slice(0, 155),
      },
    });
    productIds.set(product.slug, row.id);

    await prisma.productImage.deleteMany({ where: { productId: row.id } });
    await prisma.productImage.createMany({
      data: product.images.map((image, index) => ({
        productId: row.id,
        url: image.url,
        alt: image.alt,
        position: index,
      })),
    });

    await prisma.productVariant.deleteMany({ where: { productId: row.id } });
    await prisma.productVariant.createMany({
      data: product.sizes.map((size, index) => ({
        productId: row.id,
        size,
        color: product.colors[0]?.name ?? "Noir",
        colorHex: product.colors[0]?.hex ?? "#111111",
        sku: `${product.slug}-${size}`.toLowerCase().replace(/\s+/g, "-"),
        stock: product.stock[size] ?? 0,
        stockAlert: 5,
      })),
    });
  }

  const clientOrders = demoOrders.filter(
    (order) => order.customerEmail === "client@descomall.cm"
  );

  for (const order of clientOrders) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber: order.orderNumber },
    });
    if (existing) continue;

    const items = order.items
      .map((item) => {
        const product = demoProducts.find((entry) => entry.name === item.productName);
        if (!product) return null;
        const productId = productIds.get(product.slug);
        if (!productId) return null;
        return {
          productId,
          productName: item.productName,
          variantInfo: item.variantInfo,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (items.length === 0) continue;

    await prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        userId: client.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.total - order.shippingFee,
        shippingFee: order.shippingFee,
        total: order.total,
        shippingCity: order.city,
        notes: order.neighborhood,
        createdAt: new Date(order.createdAt),
        items: { create: items },
        statusHistory: {
          create: order.timeline.map((entry) => ({
            status: entry.status,
            note: entry.note,
            createdAt: new Date(entry.at),
          })),
        },
      },
    });
  }

  console.log(
    `Seed terminé : ${demoCategories.length} catégories, ${demoProducts.length} produits, ${clientOrders.length} commandes client.`
  );
  console.log(`Admin : ${admin.email} · Client : ${client.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
