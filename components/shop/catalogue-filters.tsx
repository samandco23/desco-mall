"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CatalogCategory, CatalogProduct } from "@/lib/types";

const PRICE_BANDS = [
  { label: "Moins de 15 000", value: "1500000" },
  { label: "15 000 – 30 000", value: "3000000" },
  { label: "Plus de 30 000", value: "99999999" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "TU"];

export function CatalogueFilters({
  categories,
  products,
  activeCategory,
}: {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  activeCategory?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedSizes = searchParams.getAll("taille");
  const selectedColor = searchParams.get("couleur") ?? "";
  const maxPrice = searchParams.get("prix") ?? "";
  const onlyNew = searchParams.get("nouveautes") === "1";
  const onlyPromo = searchParams.get("promo") === "1";

  const colors = Array.from(
    new Map(
      products.flatMap((product) =>
        product.colors.map((color) => [color.hex, color] as const)
      )
    ).values()
  ).slice(0, 10);

  const activeFilters =
    selectedSizes.length +
    (selectedColor ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (onlyNew ? 1 : 0) +
    (onlyPromo ? 1 : 0);

  function update(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleSize(size: string) {
    update((params) => {
      const current = params.getAll("taille");
      params.delete("taille");
      const next = current.includes(size)
        ? current.filter((entry) => entry !== size)
        : [...current, size];
      next.forEach((entry) => params.append("taille", entry));
    });
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {activeFilters > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-black px-1 text-[9px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </Button>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={() => router.push(pathname, { scroll: false })}
            className="text-[12px] text-ink-muted underline underline-offset-4"
          >
            Tout effacer
          </button>
        )}
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[95] overflow-y-auto bg-white px-5 py-5 md:static md:z-auto md:block md:overflow-visible md:bg-transparent md:p-0",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <div className="mb-5 flex items-center justify-between md:hidden">
          <p className="text-[15px] font-semibold">Filtres</p>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer les filtres"
            className="flex h-9 w-9 items-center justify-center rounded-sm hover:bg-paper-soft"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <aside className="space-y-7 md:sticky md:top-24">
          <FilterBlock title="Catégories">
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/catalogue"
                  className={cn(
                    "text-[13px] transition-colors hover:text-brand-black",
                    !activeCategory ? "font-semibold text-brand-black" : "text-ink-muted"
                  )}
                >
                  Toutes les pièces
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/catalogue/${category.slug}`}
                    className={cn(
                      "text-[13px] transition-colors hover:text-brand-black",
                      activeCategory === category.slug
                        ? "font-semibold text-brand-black"
                        : "text-ink-muted"
                    )}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FilterBlock>

          <FilterBlock title="Taille">
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((size) => {
                const available = products.some((product) => product.sizes.includes(size));
                if (!available) return null;
                const active = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    aria-pressed={active}
                    className={cn(
                      "flex h-8 min-w-[40px] items-center justify-center rounded-sm border px-2 text-[12px] font-medium transition-colors",
                      active
                        ? "border-brand-black bg-brand-black text-white"
                        : "border-ink-line bg-white text-ink-soft hover:border-ink-faint"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </FilterBlock>

          <FilterBlock title="Couleur">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  update((params) => params.delete("couleur"))
                }
                className={cn(
                  "h-7 rounded-sm border px-2 text-[11px] transition-colors",
                  !selectedColor
                    ? "border-brand-black text-brand-black"
                    : "border-ink-line text-ink-muted hover:border-ink-faint"
                )}
              >
                Toutes
              </button>
              {colors.map((color) => {
                const active = selectedColor === color.name;
                return (
                  <button
                    key={color.hex + color.name}
                    type="button"
                    title={color.name}
                    aria-label={color.name}
                    aria-pressed={active}
                    onClick={() =>
                      update((params) => {
                        if (active) params.delete("couleur");
                        else params.set("couleur", color.name);
                      })
                    }
                    className={cn(
                      "h-7 w-7 rounded-full border border-ink-line transition-transform hover:scale-105",
                      active && "ring-2 ring-brand-black ring-offset-2"
                    )}
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>
          </FilterBlock>

          <FilterBlock title="Prix">
            <div className="space-y-2">
              {PRICE_BANDS.map((band) => {
                const active = maxPrice === band.value;
                return (
                  <button
                    key={band.value}
                    type="button"
                    onClick={() =>
                      update((params) => {
                        if (active) params.delete("prix");
                        else params.set("prix", band.value);
                      })
                    }
                    className={cn(
                      "block text-left text-[13px] transition-colors",
                      active
                        ? "font-semibold text-brand-black"
                        : "text-ink-muted hover:text-brand-black"
                    )}
                  >
                    {band.label} XAF
                  </button>
                );
              })}
            </div>
          </FilterBlock>

          <FilterBlock title="Sélection">
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-muted">
                <input
                  type="checkbox"
                  checked={onlyNew}
                  onChange={(event) =>
                    update((params) => {
                      if (event.target.checked) params.set("nouveautes", "1");
                      else params.delete("nouveautes");
                    })
                  }
                  className="h-4 w-4 accent-brand-black"
                />
                Nouveautés
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-muted">
                <input
                  type="checkbox"
                  checked={onlyPromo}
                  onChange={(event) =>
                    update((params) => {
                      if (event.target.checked) params.set("promo", "1");
                      else params.delete("promo");
                    })
                  }
                  className="h-4 w-4 accent-brand-black"
                />
                En promotion
              </label>
            </div>
          </FilterBlock>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => router.push(pathname, { scroll: false })}
              className="hidden text-[12px] text-ink-muted underline underline-offset-4 md:block"
            >
              Réinitialiser les filtres
            </button>
          )}

          <div className="pt-2 md:hidden">
            <Button type="button" className="w-full" onClick={() => setMobileOpen(false)}>
              Voir les résultats
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-[12px] font-semibold text-brand-black">{title}</h2>
      {children}
    </div>
  );
}
