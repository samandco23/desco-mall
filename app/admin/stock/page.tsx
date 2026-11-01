import type { Metadata } from "next";
import { AlertTriangle, Boxes, PackageX } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { StockTable, type StockRow } from "@/components/admin/stock-table";
import { getProducts } from "@/lib/catalog";
import { formatNumber } from "@/lib/utils";
import { db, hasDatabase } from "@/lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stock",
  robots: { index: false },
};

export default async function AdminStockPage() {
  if (hasDatabase) {
    const variants = await db.productVariant.findMany({
      include: { product: { include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
      orderBy: [{ product: { name: "asc" } }, { size: "asc" }],
    });
    const rows: StockRow[] = variants.map((variant) => ({
      variantId: variant.id, productId: variant.productId, name: variant.product.name,
      sku: variant.sku ?? "—",
      slug: variant.product.slug, image: variant.product.images[0]?.url ?? "",
      category: variant.product.category.name,
      size: [variant.size, variant.color].filter(Boolean).join(" · ") || "TU",
      stock: variant.stock,
    }));
    return renderStock(rows);
  }
  const products = await getProducts();

  const rows: StockRow[] = products.flatMap((product) =>
    Object.entries(product.stock).map(([size, stock]) => ({
      productId: product.id,
      variantId: `${product.id}-${size}`,
      sku: "—",
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? "",
      category: product.category.name,
      size,
      stock,
    }))
  );

  return renderStock(rows);
}

function renderStock(rows: StockRow[]) {
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

      <Link href="/admin/stock/historique" className="mb-3 inline-block text-xs underline">Consulter l’historique des mouvements</Link>
      <StockTable rows={rows} />
    </div>
  );
}
