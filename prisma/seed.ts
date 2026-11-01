import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { seedCategories, seedProducts } from "../lib/catalog-seed-data";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error("Définissez SEED_ADMIN_PASSWORD (12 caractères minimum) avant le seed.");
  }
  const includeCatalog = process.env.SEED_INCLUDE_CATALOG === "true";

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

  const categoryIds = new Map<string, string>();
  for (const [index, category] of seedCategories.entries()) {
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
  if (includeCatalog) for (const product of seedProducts) {
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
        soldCount: 0,
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

    const colors = product.colors.length ? product.colors : [{ name: "Noir", hex: "#111111" }];
    for (const size of product.sizes) {
      const sizeStock = product.stock[size] ?? 0;
      for (const [colorIndex, color] of colors.entries()) {
        const colorSlug = color.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const sku = `${product.slug}-${size}${colorIndex ? `-${colorSlug}` : ""}`.toLowerCase().replace(/\s+/g, "-");
        const initialStock = Math.floor(sizeStock / colors.length) + (colorIndex < sizeStock % colors.length ? 1 : 0);
        await prisma.productVariant.upsert({
          where: { sku },
          update: { size, color: color.name, colorHex: color.hex, stockAlert: 5 },
          create: { productId: row.id, size, color: color.name, colorHex: color.hex, sku, stock: initialStock, stockAlert: 5 },
        });
      }
    }
  }

  console.log(`Seed terminé : ${seedCategories.length} catégories, ${includeCatalog ? seedProducts.length : 0} produits catalogue.`);
  console.log(`Administrateur prêt : ${admin.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
