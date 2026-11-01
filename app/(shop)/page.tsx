import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, ChevronRight, Sparkles, Truck } from "lucide-react";

import { Newsletter } from "@/components/shop/newsletter";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { TrustBar } from "@/components/shared/trust-bar";
import { Button } from "@/components/ui/button";
import { getBestSellers, getCategories, getNewProducts } from "@/lib/catalog";
import { EDITORIAL_IMAGE, HERO_IMAGE } from "@/lib/catalog-seed-data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "DESCO MALL — Mode contemporaine, sélectionnée au Cameroun",
  description: "Découvrez une sélection de mode femme, homme, enfant et accessoires avec livraison au Cameroun.",
};

export const revalidate = 3600;

export default async function HomePage() {
  const [newProducts, bestSellers, categories] = await Promise.all([
    getNewProducts(5), getBestSellers(5), getCategories(),
  ]);
  const heroProduct = newProducts[0] ?? bestSellers[0];
  const featuredUniverses = categories.filter((category) => ["femme", "homme", "enfants", "accessoires"].includes(category.slug));

  return (
    <>
      <section className="home-hero">
        <div className="container-shop grid items-center gap-8 py-8 md:grid-cols-[.9fr_1.1fr] md:gap-12 md:py-12 lg:gap-16 lg:py-14">
          <div className="relative z-10 py-2 md:py-8">
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-ink-line bg-white/80 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand-accent" /> La sélection DESCO
            </p>
            <h1 className="mt-5 max-w-[590px] text-balance text-[42px] font-semibold leading-[.98] tracking-[-0.055em] sm:text-[54px] lg:text-[68px]">
              L’allure juste.<br /><span className="font-normal italic text-brand-accent">À votre façon.</span>
            </h1>
            <p className="mt-5 max-w-[410px] text-[15px] leading-7 text-ink-muted">
              Des vêtements et accessoires choisis pour accompagner vos journées, vos sorties et les moments qui comptent.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="/catalogue">Explorer la boutique <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Link href="/catalogue?nouveautes=1" className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors hover:bg-white">
                Nouveautés <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink-muted">
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-brand-accent" /> Livraison au Cameroun</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-brand-accent" /> Paiement Mobile Money</span>
            </div>
          </div>

          <div className="home-hero-visual relative min-w-0">
            <div className="relative aspect-[1.04/1] overflow-hidden rounded-[5px] bg-paper-tint sm:aspect-[1.15/1] md:aspect-[.96/1]">
              <Image src={heroProduct?.images[0]?.url ?? HERO_IMAGE} alt={heroProduct?.images[0]?.alt ?? "Sélection mode DESCO MALL"} fill priority sizes="(max-width: 768px) 100vw, 55vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white sm:bottom-6 sm:left-6 sm:right-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/75">À découvrir maintenant</p>
                  <p className="mt-1 text-xl font-medium tracking-[-.02em] sm:text-2xl">Une sélection qui vous ressemble.</p>
                </div>
                {heroProduct && <Link href={`/produit/${heroProduct.slug}`} aria-label={`Découvrir ${heroProduct.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-black transition-transform hover:scale-105"><ArrowRight className="h-5 w-5" /></Link>}
              </div>
            </div>
            {heroProduct && <Link href={`/produit/${heroProduct.slug}`} className="absolute -bottom-4 right-3 max-w-[220px] rounded-md border border-ink-line bg-white px-4 py-3 shadow-floating sm:-right-4 sm:bottom-6 sm:max-w-[240px]">
              <p className="text-[10px] uppercase tracking-[.12em] text-ink-faint">Pièce sélectionnée</p>
              <div className="mt-1 flex items-center justify-between gap-3"><span className="line-clamp-1 text-[12px] font-semibold">{heroProduct.name}</span><span className="shrink-0 text-[12px] font-bold">{formatPrice(heroProduct.price)}</span></div>
            </Link>}
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="container-shop py-12 md:py-[72px]">
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
          <div><p className="eyebrow">Trouvez votre style</p><h2 className="mt-2 text-[26px] font-semibold tracking-[-.04em] sm:text-[32px]">Explorer les univers</h2></div>
          <Link href="/catalogue" className="mb-1 inline-flex items-center gap-1 text-[12px] font-semibold">Tout le catalogue <ChevronRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featuredUniverses.map((category) => (
            <Link key={category.slug} href={`/catalogue/${category.slug}`} className="group">
              <div className="relative aspect-[.92/1] overflow-hidden rounded-[4px] bg-paper-tint">
                {category.image && <Image src={category.image} alt={`Collection ${category.name}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3 text-white sm:p-4"><div><h3 className="text-[16px] font-semibold sm:text-[18px]">{category.name}</h3><p className="mt-0.5 text-[11px] text-white/80">{category.productCount ?? 0} articles</p></div><span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 transition-colors group-hover:bg-white group-hover:text-brand-black"><ArrowRight className="h-4 w-4" /></span></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-ink-line bg-white">
        <div className="container-shop py-12 md:py-[68px]">
          <SectionHeading eyebrow="Fraîchement arrivé" title="Les nouveautés" description="Les dernières pièces ajoutées à la boutique." actionLabel="Tout voir" actionHref="/catalogue?nouveautes=1" />
          <ProductGrid products={newProducts} />
        </div>
      </section>

      <section className="home-story">
        <div className="container-shop grid items-center gap-8 py-12 md:grid-cols-2 md:gap-14 md:py-[72px]">
          <div className="relative aspect-[1.12/1] overflow-hidden rounded-[4px] bg-paper-tint"><Image src={EDITORIAL_IMAGE} alt="L’univers mode et création DESCO" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          <div className="py-1"><p className="eyebrow">DESCO, le style en mouvement</p><h2 className="mt-3 max-w-md text-balance text-[30px] font-semibold leading-[1.05] tracking-[-.045em] sm:text-[40px]">Des pièces choisies avec soin. Pour vivre, bouger et se retrouver.</h2><p className="mt-4 max-w-md text-[14px] leading-7 text-ink-muted">Explorez des collections pour toute la famille, des essentiels aux pièces qui attirent le regard.</p><Button asChild variant="outline" className="mt-6 rounded-full"><Link href="/a-propos">Découvrir DESCO <ArrowRight className="h-4 w-4" /></Link></Button></div>
        </div>
      </section>

      {bestSellers.length > 0 && <section className="container-shop py-12 md:py-[72px]"><SectionHeading eyebrow="Les favoris" title="Les pièces à retrouver" actionLabel="Voir le catalogue" actionHref="/catalogue?tri=populaires" /><ProductGrid products={bestSellers} /></section>}

      <section className="bg-brand-black text-white">
        <div className="container-shop grid items-center gap-6 py-10 md:grid-cols-[1fr_auto] md:py-12">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/55">Vous êtes revendeur ?</p><h2 className="mt-2 max-w-xl text-balance text-[26px] font-semibold leading-tight tracking-[-.035em] md:text-[34px]">Développez votre boutique avec DESCO.</h2><p className="mt-2 max-w-lg text-[13px] leading-6 text-white/65">Découvrez nos conditions dédiées aux professionnels et distributeurs.</p></div>
          <Button asChild className="rounded-full bg-white text-brand-black hover:bg-white/90"><Link href="/a-propos#distributeurs">Parlons de votre projet <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>
      <Newsletter />
    </>
  );
}
