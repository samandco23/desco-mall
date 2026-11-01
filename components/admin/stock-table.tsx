"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { updateVariantStock } from "@/lib/actions/admin";

export type StockRow = {
  variantId: string;
  sku: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  size: string;
  stock: number;
};

export function StockTable({ rows }: { rows: StockRow[] }) {
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function saveStock(variantId: string, value: number, sku: string) {
    setPendingId(variantId);
    setMessage("");
    const result = await updateVariantStock({ variantId, stock: value, sku });
    setMessage(result.message);
    setPendingId(null);
    if (result.ok) window.location.reload();
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (lowOnly && row.stock > 5) return false;
      if (!needle) return true;
      return `${row.name} ${row.slug} ${row.size} ${row.category} ${row.sku}`
        .toLowerCase()
        .includes(needle);
    });
  }, [rows, query, lowOnly]);

  return (
    <div className="rounded-md border border-ink-line bg-white">
      <div className="flex flex-col gap-2 border-b border-ink-line p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit, une taille…"
            aria-label="Rechercher dans le stock"
            className="h-9 pl-9 text-[12.5px]"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-ink-muted">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(event) => setLowOnly(event.target.checked)}
            className="h-4 w-4 accent-brand-black"
          />
          Stock faible uniquement (≤ 5)
        </label>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>SKU externe</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>État</TableHead>
            <TableHead className="text-right">Ajuster</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((row) => (
            <TableRow key={row.variantId}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                    {row.image && (
                      <Image src={row.image} alt={row.name} fill sizes="32px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium">{row.name}</p>
                    <p className="truncate text-[10px] text-ink-faint">/{row.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-ink-muted">{row.category}</TableCell>
              <TableCell className="font-medium">{row.size}</TableCell>
              <TableCell><input aria-label={`SKU externe ${row.name} ${row.size}`} defaultValue={row.sku === "—" ? "" : row.sku} placeholder="SKU externe" id={`sku-${row.variantId}`} className="h-8 w-32 rounded border border-ink-line px-2 text-xs" /></TableCell>
              <TableCell>{row.stock}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "rounded-[4px] px-2 py-1 text-[10px] font-semibold",
                    row.stock === 0
                      ? "bg-brand-accent-bg text-brand-accent"
                      : row.stock <= 5
                        ? "bg-[#FFF7E8] text-[#9A6508]"
                        : "bg-[#EEF7F0] text-brand-success"
                  )}
                >
                  {row.stock === 0 ? "Épuisé" : row.stock <= 5 ? "Faible" : "Disponible"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <input aria-label={`Stock ${row.name} ${row.size}`} type="number" min="0" defaultValue={row.stock} id={`stock-${row.variantId}`} className="h-8 w-20 rounded border border-ink-line px-2 text-right text-xs" />
                  <button type="button" disabled={pendingId === row.variantId} onClick={() => {
                    const input = document.getElementById(`stock-${row.variantId}`) as HTMLInputElement | null;
                    const skuInput = document.getElementById(`sku-${row.variantId}`) as HTMLInputElement | null;
                    if (input) void saveStock(row.variantId, Number(input.value), skuInput?.value ?? "");
                  }} className="text-[11px] font-medium underline-offset-4 hover:underline disabled:opacity-50">
                    {pendingId === row.variantId ? <Loader2 className="h-3 w-3 animate-spin" /> : "Enregistrer"}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-[12px] text-ink-muted">
                Aucune variante ne correspond à ces filtres.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {message && <p role="status" className="border-t border-ink-line px-4 py-2 text-xs">{message}</p>}
      <p className="border-t border-ink-line px-4 py-2.5 text-[10.5px] text-ink-faint">
        {filtered.length} variante{filtered.length > 1 ? "s" : ""} affichée
        {filtered.length > 1 ? "s" : ""} sur {rows.length}
      </p>
    </div>
  );
}
