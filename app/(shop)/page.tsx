import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";

import { Newsletter } from "@/components/shop/newsletter";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrustBar } from "@/components/shared/trust-bar";
import { Button } from "@/components/ui/button";
import {
  getBestSellers,
  getCategories,
  getNewProducts,
} from "@/lib/catalog";
import { EDITORIAL_IMAGE, HERO_IMAGE } from "@/lib/demo-data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "DESCO MALL — Le Distributeur qui Distribue les Distributeurs",
  description:
    "Mode camerounaise pour femme, homme et enfant. Robes, ensembles, wax et accessoires livrés à Douala et Yaoundé. Paiement MTN MoMo et Orange Money.",
};

export const revalidate = 3600;

export default async function HomePage() {
  const [newProducts, bestSellers, categories] = await Promise.all([
    getNewProducts(4),
    getBestSellers(4),
    getCategories(),
  ]);

  const featuredUniverses = categories.filter((category) =>
    ["femme", "homme", "enfants", "accessoires"].includes(category.slug)
  );

  return (
    <>
      <section className="container-shop grid items-center gap-8 py-8 md:grid-cols-[1.05fr_1fr] md:gap-12 md:py-14">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
            Collection octobre 2026
          </p>
          <h1 className="mt-4 max-w-[560px] text-balance text-[40px] font-bold leading-[1.02] tracking-[-0.04em] text-brand-black sm:text-[52px] lg:text-[56px]">
            L&apos;allure camerounaise, sans compromis.
          </h1>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-ink-muted">
            Des pièces choisies pour le climat, le mouvement et les grandes occasions.
            Livraison à Douala et Yaoundé en 48 h, paiement Mobile Money.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/catalogue">
                Découvrir la collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/catalogue?nouveautes=1">Les nouveautés</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-ink-soft" /> Livraison 48 h
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-ink-soft" /> MTN MoMo & Orange Money
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-ink-soft" /> Retours 7 jours
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-tint md:aspect-[5/6]">
            <Image
              src={HERO_IMAGE}
              alt="Robe longue Sawa portée près de la mer"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover"
            />
          </div>
          <Link
            href="/produit/robe-longue-sawa"
            className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 rounded-md bg-white/95 px-4 py-3 shadow-floating backdrop-blur-sm transition-colors hover:bg-white md:right-auto"
          >
            <div>
              <p className="text-[10.5px] text-ink-muted">Pièce phare</p>
              <p className="mt-0.5 text-[12.5px] font-semibold text-brand-black">
                Robe longue Sawa
              </p>
            </div>
            <span className="text-[13px] font-bold">{formatPrice(2450000)}</span>
          </Link>
        </div>
      </section>

      <TrustBar />

      <section className="container-shop py-12 md:py-16">
        <SectionHeading
          eyebrow="Univers"
          title="Explorer par catégorie"
          actionLabel="Tous les produits"
          actionHref="/catalogue"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {featuredUniverses.map((category) => (
            <Link key={category.slug} href={`/catalogue/${category.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-paper-tint">
                <Image
                  src={category.image}
                  alt={`Univers ${category.name}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <h3 className="text-[13.5px] font-semibold">{category.name}</h3>
                <span className="text-[11.5px] text-ink-faint">{category.productCount} pièces</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-line">
        <div className="container-shop py-12 md:py-16">
          <SectionHeading
            eyebrow="Tout juste arrivé"
            title="Nouveautés"
            description="Les pièces qui viennent d'entrer dans la boutique, avant qu'elles ne partent."
            actionLabel="Tout voir"
            actionHref="/catalogue?nouveautes=1"
          />
          <ProductGrid products={newProducts} />
        </div>
      </section>

      <section className="bg-paper-soft">
        <div className="container-shop grid items-center gap-8 py-12 md:grid-cols-2 md:gap-14 md:py-16">
          <div className="relative aspect-[5/6] overflow-hidden rounded-lg bg-paper-tint md:aspect-[4/3]">
            <Image
              src={EDITORIAL_IMAGE}
              alt="Atelier de confection à Douala"
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="eyebrow mb-3">Savoir-faire</p>
            <h2 className="max-w-sm text-balance text-[28px] font-bold leading-tight tracking-[-0.03em] md:text-[34px]">
              Le wax, cousu à Douala.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-muted">
              Nous travaillons avec trois ateliers partenaires à Douala et à Bafoussam.
              Petites séries, coupes contemporaines et finitions vérifiées pièce par pièce.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Wax et coton sélectionnés chez des fournisseurs locaux",
                "Coupes pensées pour le climat camerounais",
                "Chaque pièce contrôlée avant expédition",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-black text-white">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/catalogue/wax-culture">
                Explorer Wax & Culture
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-shop py-12 md:py-16">
        <SectionHeading
          eyebrow="Les plus vendus"
          title="Plébiscités par nos clients"
          actionLabel="Voir le catalogue"
          actionHref="/catalogue?tri=populaires"
        />
        <ProductGrid products={bestSellers} />
      </section>

      <section className="bg-brand-black text-white">
        <div className="container-shop grid items-center gap-8 py-12 md:grid-cols-[1.4fr_1fr] md:py-14">
          <div>
            <p className="eyebrow mb-3 text-white/50">Le distributeur qui distribue les distributeurs</p>
            <h2 className="max-w-lg text-balance text-[26px] font-bold leading-tight tracking-[-0.03em] md:text-[32px]">
              Vous tenez une boutique ? Revendez DESCO.
            </h2>
            <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-white/55">
              Tarifs grossiste automatiques dès 3 pièces (−5 %), jusqu&apos;à −15 % à partir de 25
              pièces. Stock livré à Douala et accompagnement WhatsApp. Nous fournissons les
              visuels et les fiches produits.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button
              asChild
              className="bg-white text-brand-black hover:bg-white/90"
            >
              <Link href="/a-propos#distributeurs">Devenir distributeur</Link>
            </Button>
            <a
              href="https://wa.me/237655000000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[52px] items-center justify-center rounded-md border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              Parler à un conseiller
            </a>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
