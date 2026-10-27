import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CatalogueFilters } from "@/components/shop/catalogue-filters";
import { CatalogueToolbar } from "@/components/shop/catalogue-toolbar";
import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts, type ProductFilters } from "@/lib/catalog";
import type { CatalogCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type SearchParams = Record<string, string | string[] | undefined>;

const PAGE_SIZE = 9;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function all(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function parseSort(value: string | undefined): NonNullable<ProductFilters["sort"]> {
  if (value === "populaires" || value === "prix-asc" || value === "prix-desc") {
    return value;
  }
  return "nouveautes";
}

function pageHref(
  base: string,
  searchParams: SearchParams,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach((entry) => params.append(key, entry));
    else params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

function pageNumbers(current: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const start = Math.max(1, Math.min(current - 2, total - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export async function CatalogueView({
  category,
  searchParams,
}: {
  category?: CatalogCategory;
  searchParams: SearchParams;
}) {
  const categories = await getCategories();
  const allProducts = await getProducts();

  const isPromo = first(searchParams.promo) === "1";
  const filters: ProductFilters = {
    category: category?.slug,
    sort: parseSort(first(searchParams.tri)),
    sizes: all(searchParams.taille),
    colors: all(searchParams.couleur),
    maxPrice: first(searchParams.prix) ? Number(first(searchParams.prix)) : undefined,
    onlyNew: first(searchParams.nouveautes) === "1",
    onlyPromo: isPromo,
  };

  const filtered = await getProducts(filters);
  const requestedPage = Number(first(searchParams.page) ?? "1");
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    totalPages
  );
  const products = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const basePath = category ? `/catalogue/${category.slug}` : "/catalogue";

  const title = isPromo
    ? "Soldes"
    : category?.name ?? "Toutes les pièces";
  const description = isPromo
    ? "Les pièces en promotion, jusqu'à épuisement des stocks. Prix barrés vérifiés, quantités limitées."
    : category?.description ??
      "Robes, chemises, ensembles et accessoires : la sélection DESCO MALL pour le Cameroun.";

  return (
    <div className="container-shop py-6 md:py-8">
      <nav aria-label="Fil d'Ariane" className="text-[11.5px] text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-brand-black">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/catalogue" className="transition-colors hover:text-brand-black">
              Boutique
            </Link>
          </li>
          {category && (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-brand-black">{category.name}</li>
            </>
          )}
        </ol>
      </nav>

      <header className="pb-7 pt-6 md:pb-9 md:pt-8">
        <h1 className="text-[28px] font-bold tracking-[-0.03em] md:text-[34px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
          {description}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[210px_1fr] md:gap-10">
        <CatalogueFilters
          categories={categories}
          products={allProducts}
          activeCategory={category?.slug}
        />

        <div>
          <CatalogueToolbar count={filtered.length} />

          {products.length > 0 ? (
            <>
              <ProductGrid products={products} columns={3} className="lg:grid-cols-3" />
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination du catalogue"
                  className="mt-12 flex items-center justify-center gap-1.5"
                >
                  <Link
                    href={pageHref(basePath, searchParams, Math.max(1, page - 1))}
                    aria-label="Page précédente"
                    aria-disabled={page === 1}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-sm border border-ink-line text-ink-soft transition-colors hover:border-ink-faint",
                      page === 1 && "pointer-events-none opacity-40"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                  {pageNumbers(page, totalPages).map((number) => (
                    <Link
                      key={number}
                      href={pageHref(basePath, searchParams, number)}
                      aria-current={number === page ? "page" : undefined}
                      className={cn(
                        "flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 text-[12.5px] font-medium transition-colors",
                        number === page
                          ? "border-brand-black bg-brand-black text-white"
                          : "border-ink-line text-ink-soft hover:border-ink-faint"
                      )}
                    >
                      {number}
                    </Link>
                  ))}
                  <Link
                    href={pageHref(basePath, searchParams, Math.min(totalPages, page + 1))}
                    aria-label="Page suivante"
                    aria-disabled={page === totalPages}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-sm border border-ink-line text-ink-soft transition-colors hover:border-ink-faint",
                      page === totalPages && "pointer-events-none opacity-40"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              title="Aucune pièce ne correspond"
              description="Essayez une autre taille, une autre couleur ou retirez les filtres actifs."
              actionLabel="Voir tout le catalogue"
              actionHref="/catalogue"
            />
          )}

          {products.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/catalogue?tri=populaires">Voir les plus vendus</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
