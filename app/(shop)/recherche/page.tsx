import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { ProductGrid } from "@/components/shop/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBestSellers, searchCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Recherchez une pièce DESCO MALL par nom, catégorie ou matière.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q ?? "").trim();
  const results = query ? await searchCatalog(query) : [];
  const suggestions = query ? [] : await getBestSellers(4);

  return (
    <div className="container-shop py-8 md:py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Recherche</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">
          {query ? "Résultats de recherche" : "Que cherchez-vous ?"}
        </h1>
        <form action="/recherche" method="get" className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Robe, chemise, wax, ensemble…"
              aria-label="Rechercher un produit"
              className="pl-10"
              autoFocus
            />
          </div>
          <Button type="submit">Rechercher</Button>
        </form>
        {query && (
          <p className="mt-4 text-[13px] text-ink-muted">
            {results.length > 0 ? (
              <>
                <span className="font-semibold text-brand-black">{results.length}</span>{" "}
                {results.length > 1 ? "pièces trouvées" : "pièce trouvée"} pour «{" "}
                <span className="font-medium text-brand-black">{query}</span> »
              </>
            ) : (
              <>
                Aucun résultat pour « <span className="font-medium text-brand-black">{query}</span> »
              </>
            )}
          </p>
        )}
      </div>

      <div className="mt-10">
        {!query && (
          <>
            <h2 className="mb-5 text-[18px] font-semibold">Les plus vendus</h2>
            <ProductGrid products={suggestions} />
          </>
        )}

        {query && results.length > 0 && <ProductGrid products={results} />}

        {query && results.length === 0 && (
          <div className="mx-auto max-w-xl">
            <EmptyState
              icon={Search}
              title="Aucune pièce ne correspond"
              description="Vérifiez l'orthographe ou essayez un terme plus large. Notre équipe peut aussi vous aider sur WhatsApp."
              actionLabel="Voir tout le catalogue"
              actionHref="/catalogue"
            />
            <p className="mt-4 text-center text-[12px] text-ink-muted">
              Suggestions :{" "}
              {["Robe", "Wax", "Chemise", "Ensemble"].map((term, index) => (
                <span key={term}>
                  {index > 0 && " · "}
                  <Link
                    href={`/recherche?q=${encodeURIComponent(term)}`}
                    className="underline underline-offset-4 hover:text-brand-black"
                  >
                    {term}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
