"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CatalogCategory, CatalogProduct } from "@/lib/types";
import { formatNumber, formatPrice } from "@/lib/utils";

export function ProductsTable({
  products,
  categories,
}: {
  products: CatalogProduct[];
  categories: CatalogCategory[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      if (needle && !`${product.name} ${product.slug}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (category !== "all" && product.category.slug !== category) return false;
      const totalStock = Object.values(product.stock).reduce((sum, value) => sum + value, 0);
      if (stockFilter === "low" && totalStock > 15) return false;
      if (stockFilter === "out" && totalStock > 0) return false;
      return true;
    });
  }, [products, query, category, stockFilter]);

  return (
    <div className="rounded-md border border-ink-line bg-white">
      <div className="flex flex-col gap-2 border-b border-ink-line p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit ou un slug…"
            aria-label="Rechercher un produit"
            className="h-9 pl-9 text-[12.5px]"
          />
        </div>
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrer par catégorie"
          className="h-9 sm:w-[170px]"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((entry) => (
            <option key={entry.slug} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </Select>
        <Select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
          aria-label="Filtrer par stock"
          className="h-9 sm:w-[150px]"
        >
          <option value="all">Tout le stock</option>
          <option value="low">Stock faible</option>
          <option value="out">Épuisé</option>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((product) => {
            const totalStock = Object.values(product.stock).reduce((sum, value) => sum + value, 0);
            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium">{product.name}</p>
                      <p className="truncate text-[10.5px] text-ink-faint">/{product.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-ink-muted">{product.category.name}</TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {formatPrice(product.price)}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      totalStock === 0
                        ? "font-semibold text-brand-accent"
                        : totalStock <= 15
                          ? "font-semibold text-[#9A6508]"
                          : "text-ink-muted"
                    }
                  >
                    {formatNumber(totalStock)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.isNew && <Badge variant="muted">Nouveau</Badge>}
                    {product.isFeatured && <Badge variant="outline">Mis en avant</Badge>}
                    {!product.isNew && !product.isFeatured && <Badge variant="success">Actif</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="text-[11.5px] font-medium underline-offset-4 hover:underline"
                  >
                    Modifier
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-[12px] text-ink-muted">
                Aucun produit ne correspond à cette recherche.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="border-t border-ink-line px-4 py-2.5 text-[10.5px] text-ink-faint">
        {filtered.length} produit{filtered.length > 1 ? "s" : ""} affiché
        {filtered.length > 1 ? "s" : ""} sur {products.length}
      </p>
    </div>
  );
}
