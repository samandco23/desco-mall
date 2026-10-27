import type { Metadata } from "next";
import { AlertTriangle, Boxes, PackageX } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { StockTable, type StockRow } from "@/components/admin/stock-table";
import { getProducts } from "@/lib/catalog";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Stock",
  robots: { index: false },
};

export default async function AdminStockPage() {
  const products = await getProducts();

  const rows: StockRow[] = products.flatMap((product) =>
    Object.entries(product.stock).map(([size, stock]) => ({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? "",
      category: product.category.name,
      size,
      stock,
    }))
  );

  const totalUnits = rows.reduce((sum, row) => sum + row.stock, 0);
  const low = rows.filter((row) => row.stock > 0 && row.stock <= 5).length;
  const out = rows.filter((row) => row.stock === 0).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Stock"
        description="Toutes les variantes, taille par taille. Le seuil d'alerte par défaut est de 5 pièces."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatsCard label="Unités en stock" value={formatNumber(totalUnits)} hint="toutes variantes" icon={Boxes} />
        <StatsCard label="Stocks faibles" value={formatNumber(low)} hint="5 pièces ou moins" icon={AlertTriangle} accent />
        <StatsCard label="Variantes épuisées" value={formatNumber(out)} hint="à réapprovisionner" icon={PackageX} />
      </div>

      <StockTable rows={rows} />
    </div>
  );
}
