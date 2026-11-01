import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { getCategories } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Catégories",
  robots: { index: false },
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Catégories"
        description="L'arborescence de la boutique. Chaque catégorie possède une page publique indexée."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.slug} className="overflow-hidden rounded-md border border-ink-line bg-white">
            <div className="relative aspect-[16/9] bg-paper-tint">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[14px] font-semibold">{category.name}</h2>
                  <p className="mt-0.5 text-[10.5px] text-ink-faint">/{category.slug}</p>
                </div>
                <span className="rounded-[4px] bg-paper-soft px-2 py-1 text-[10px] font-semibold text-ink-muted">
                  {category.productCount} produits
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-ink-muted">
                {category.description}
              </p>
              <Link
                href={`/catalogue/${category.slug}`}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium underline-offset-4 hover:underline"
              >
                Voir la page publique <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-4 rounded-md border border-ink-line bg-white p-4">
        <h2 className="text-[13.5px] font-semibold">Gestion des catégories</h2>
        <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-ink-muted">
          La création et la réorganisation par glisser-déposer sont prévues dans le schéma
          Prisma (parent/enfant, position). L&apos;édition des catégories sera disponible dans une prochaine mise à jour.
        </p>
      </section>
    </div>
  );
}
