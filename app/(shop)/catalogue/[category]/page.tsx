import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogueView } from "@/components/shop/catalogue-view";
import { getCategories } from "@/lib/catalog";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === params.category);
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === params.category);
  if (!category) notFound();

  return <CatalogueView category={category} searchParams={searchParams} />;
}
