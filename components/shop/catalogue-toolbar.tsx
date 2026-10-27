"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";

export function CatalogueToolbar({ count }: { count: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get("tri") ?? "nouveautes";

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "nouveautes") params.delete("tri");
    else params.set("tri", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-4 border-b border-ink-line pb-3">
      <p className="text-[12px] text-ink-muted">
        <span className="font-semibold text-brand-black">{formatNumber(count)}</span>{" "}
        {count > 1 ? "pièces" : "pièce"}
      </p>
      <div className="flex items-center gap-2">
        <span className="hidden text-[12px] text-ink-muted sm:block">Trier par</span>
        <Select
          value={sort}
          onChange={(event) => changeSort(event.target.value)}
          aria-label="Trier les produits"
          className="h-9 w-[170px] text-[12px]"
        >
          <option value="nouveautes">Nouveautés</option>
          <option value="populaires">Les plus vendus</option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
        </Select>
      </div>
    </div>
  );
}
