import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nouveau produit",
  robots: { index: false },
};

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Nouveau produit"
        description="Créez une fiche produit. Le slug est généré automatiquement à partir du nom."
      />
      <ProductForm categories={categories} />
    </div>
  );
}
