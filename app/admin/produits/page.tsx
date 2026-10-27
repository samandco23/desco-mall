import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Produits",
  robots: { index: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { enregistre?: string };
}) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Produits"
        description="Gérez les fiches, les prix et la disponibilité de vos pièces."
        action={
          <Button asChild size="sm">
            <Link href="/admin/produits/nouveau">Nouveau produit</Link>
          </Button>
        }
      />

      {searchParams.enregistre === "1" && (
        <p className="mb-4 flex items-center gap-2 rounded-sm border border-brand-success/20 bg-[#EEF7F0] px-3 py-2.5 text-[12px] font-medium text-brand-success">
          <Check className="h-3.5 w-3.5" />
          Produit enregistré. La fiche est à jour.
        </p>
      )}

      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
