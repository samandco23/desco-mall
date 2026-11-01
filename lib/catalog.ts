import type { CatalogCategory, CatalogProduct } from "@/lib/types";
import { hasDatabase } from "@/lib/db";

export type ProductFilters = {
  category?: string;
  search?: string;
  sort?: "nouveautes" | "prix-asc" | "prix-desc" | "populaires";
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  onlyNew?: boolean;
  onlyPromo?: boolean;
};

const byNewest = (a: CatalogProduct, b: CatalogProduct) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

async function loadProducts(): Promise<CatalogProduct[]> {
  if (!hasDatabase) return [];

  try {
    const { db } = await import("@/lib/db");
    const rows = await db.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => {
      const sizes = Array.from(
        new Set(row.variants.map((variant) => variant.size).filter(Boolean))
      ) as string[];
      const colors = Array.from(
        new Map(
          row.variants
            .filter((variant) => variant.color)
            .map((variant) => [
              variant.color as string,
              { name: variant.color as string, hex: variant.colorHex ?? "#111111" },
            ])
        ).values()
      );
      const stock: Record<string, number> = {};
      for (const variant of row.variants) {
        const size = variant.size ?? "TU";
        stock[size] = (stock[size] ?? 0) + variant.stock;
      }

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        details: row.metaDesc ? [row.metaDesc] : [],
        price: row.price,
        comparePrice: row.comparePrice ?? undefined,
        category: { slug: row.category.slug, name: row.category.name },
        images:
          row.images.length > 0
            ? row.images.map((image) => ({
                url: image.url,
                alt: image.alt ?? row.name,
              }))
            : [{ url: "/products/photo-1523381210434-271e8be1f52b.jpg", alt: row.name }],
        colors: colors.length > 0 ? colors : [{ name: "Noir", hex: "#111111" }],
        sizes: sizes.length > 0 ? sizes : ["TU"],
        stock,
        isNew: row.isNew,
        isFeatured: row.isFeatured,
        rating: 4.8,
        reviewCount: 0,
        soldCount: row.soldCount,
        tags: row.tags.map((entry) => entry.tag.slug),
        createdAt: row.createdAt.toISOString(),
      } satisfies CatalogProduct;
    });
  } catch (error) {
    console.error("[catalog] Lecture Prisma impossible.", error);
    return [];
  }
}

export async function getProducts(filters: ProductFilters = {}): Promise<CatalogProduct[]> {
  const all = await loadProducts();
  let products = [...all];

  if (filters.category) {
    products = products.filter((product) => product.category.slug === filters.category);
  }
  if (filters.search) {
    const needle = filters.search.trim().toLowerCase();
    if (needle) {
      products = products.filter((product) => {
        const haystack = `${product.name} ${product.description} ${product.category.name} ${product.tags.join(" ")}`.toLowerCase();
        return haystack.includes(needle);
      });
    }
  }
  if (filters.maxPrice) {
    products = products.filter((product) => product.price <= filters.maxPrice!);
  }
  if (filters.onlyNew) {
    products = products.filter((product) => product.isNew);
  }
  if (filters.onlyPromo) {
    products = products.filter(
      (product) => product.comparePrice && product.comparePrice > product.price
    );
  }
  if (filters.sizes && filters.sizes.length > 0) {
    products = products.filter((product) =>
      filters.sizes!.some((size) => product.sizes.includes(size))
    );
  }
  if (filters.colors && filters.colors.length > 0) {
    products = products.filter((product) =>
      filters.colors!.some((color) =>
        product.colors.some((entry) => entry.name.toLowerCase() === color.toLowerCase())
      )
    );
  }

  switch (filters.sort) {
    case "prix-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "prix-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "populaires":
      products.sort((a, b) => b.soldCount - a.soldCount);
      break;
    default:
      products.sort(byNewest);
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const products = await loadProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<CatalogProduct[]> {
  const products = await loadProducts();
  const featured = products.filter((product) => product.isFeatured);
  return (featured.length > 0 ? featured : products).slice(0, limit);
}

export async function getNewProducts(limit = 8): Promise<CatalogProduct[]> {
  const products = await loadProducts();
  return [...products].sort(byNewest).slice(0, limit);
}

export async function getBestSellers(limit = 8): Promise<CatalogProduct[]> {
  const products = await loadProducts();
  return [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, limit);
}

export async function getRelatedProducts(
  product: CatalogProduct,
  limit = 4
): Promise<CatalogProduct[]> {
  const products = await loadProducts();
  const sameCategory = products.filter(
    (entry) => entry.category.slug === product.category.slug && entry.id !== product.id
  );
  const fallback = products.filter(
    (entry) => entry.category.slug !== product.category.slug && entry.id !== product.id
  );
  return [...sameCategory, ...fallback].slice(0, limit);
}

export async function getCategories(): Promise<CatalogCategory[]> {
  if (!hasDatabase) return [];
  try {
    const { db } = await import("@/lib/db");
    const categories = await db.category.findMany({ where: { isActive: true }, include: { _count: { select: { products: { where: { isActive: true } } } } }, orderBy: { position: "asc" } });
    return categories.map((category) => ({ name: category.name, slug: category.slug, description: category.description ?? "", image: category.imageUrl ?? "", productCount: category._count.products }));
  } catch (error) {
    console.error("[catalog] Lecture des catégories impossible.", error);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<CatalogCategory | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function searchCatalog(query: string): Promise<CatalogProduct[]> {
  return getProducts({ search: query });
}
