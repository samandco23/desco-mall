import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm, type ProductFormInitial } from "@/components/admin/product-form";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Modifier un produit",
  robots: { index: false },
};

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const product = products.find(
    (entry) => entry.id === params.id || entry.slug === params.id
  );
  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceXaf: Math.round(product.price / 100),
    comparePriceXaf: product.comparePrice ? Math.round(product.comparePrice / 100) : undefined,
    categorySlug: product.category.slug,
    stock: Object.values(product.stock).reduce((sum, value) => sum + value, 0),
    sizes: product.sizes.join(", "),
    imageUrl: product.images[0]?.url,
    isActive: true,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    metaTitle: "",
    metaDesc: "",
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title={product.name}
        description={`Modification de la fiche /${product.slug}. Les variantes existantes conservent leur stock.`}
      />
      <ProductForm categories={categories} initial={initial} />
    </div>
  );
}
