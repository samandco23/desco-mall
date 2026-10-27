import type { Metadata } from "next";

import { CatalogueView } from "@/components/shop/catalogue-view";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Toutes les pièces DESCO MALL : femmes, hommes, enfants et accessoires. Livraison Cameroun.",
};

export default function CataloguePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <CatalogueView searchParams={searchParams} />;
}
