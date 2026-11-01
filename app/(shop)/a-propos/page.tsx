import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EDITORIAL_IMAGE, STORY_IMAGE } from "@/lib/catalog-seed-data";

export const metadata: Metadata = {
  title: "Notre histoire",
  description:
    "DESCO MALL, le distributeur qui distribue les distributeurs. Mode camerounaise, ateliers locaux et réseau de boutiques partenaires.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="container-shop grid items-center gap-8 py-10 md:grid-cols-2 md:gap-14 md:py-16">
        <div>
          <p className="eyebrow">Notre histoire</p>
          <h1 className="mt-3 max-w-lg text-balance text-[34px] font-bold leading-[1.05] tracking-[-0.04em] md:text-[44px]">
            Le distributeur qui distribue les distributeurs.
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-muted">
            DESCO MALL est né à Douala d&apos;un constat simple : il est plus facile de trouver
            une pièce mode à Paris qu&apos;à Akwa, et les boutiques camerounaises méritent mieux
            qu&apos;un approvisionnement au hasard.
          </p>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-muted">
            Nous sélectionnons, produisons et distribuons des vêtements pensés pour le climat et
            le quotidien camerounais. Puis nous les rendons accessibles aux boutiques de quartier
            comme aux clients finaux.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-tint">
          <Image
            src={STORY_IMAGE}
            alt="Portrait d'une cliente DESCO MALL à Douala"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 540px"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-ink-line bg-paper-soft">
        <div className="container-shop grid gap-8 py-12 md:grid-cols-3">
          {[
            {
              title: "Sélectionner",
              text: "Trois ateliers partenaires à Douala et Bafoussam, des tissus achetés localement et des coupes vérifiées pièce par pièce.",
            },
            {
              title: "Distribuer",
              text: "Une boutique en ligne pour les clients, un programme de revendeurs pour les boutiques qui veulent compléter leur offre.",
            },
            {
              title: "Durer",
              text: "Des prix stables, des retours simples et un service client joignable sur WhatsApp. Pas de vente à tout prix.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="text-[16px] font-semibold">{item.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shop grid items-center gap-8 py-12 md:grid-cols-2 md:gap-14 md:py-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper-tint">
          <Image
            src={EDITORIAL_IMAGE}
            alt="Atelier de confection partenaire à Douala"
            fill
            sizes="(max-width: 768px) 100vw, 540px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow">Savoir-faire</p>
          <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">
            Des vêtements cousus ici.
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
            Chaque collection est développée avec nos ateliers partenaires : patronage, essais,
            ajustements. Nous payons à la pièce, à un tarif convenu à l&apos;avance, et nous
            commandons en petites séries pour ne pas produire d&apos;invendus.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              "Wax et coton sourcés au Cameroun",
              "Petites séries numérotées",
              "Chaque pièce contrôlée avant expédition",
              "Aucune production en surstock",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-black text-white">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="distributeurs" className="scroll-mt-24 bg-brand-black text-white">
        <div className="container-shop py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <p className="eyebrow text-white/50">Programme revendeurs</p>
              <h2 className="mt-3 max-w-xl text-balance text-[30px] font-bold leading-tight tracking-[-0.03em] md:text-[36px]">
                Vendez DESCO dans votre boutique.
              </h2>
              <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-white/55">
                Vous tenez une boutique de mode, un concept store ou un salon de coiffure à
                Douala, Yaoundé, Bafoussam ou ailleurs ? Nous livrons des collections prêtes à
                vendre, avec les visuels et les fiches produits.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
              <Button asChild className="bg-white text-brand-black hover:bg-white/90">
                <a href="https://wa.me/237655000000?text=Bonjour%2C%20je%20souhaite%20devenir%20revendeur%20DESCO%20MALL.">
                  <MessageCircle className="h-4 w-4" /> Parler à un conseiller
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
              >
                <Link href="/catalogue">
                  Voir le catalogue <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-4">
            {[
              { title: "−5 % dès 3 pièces", text: "Remise grossiste automatique, sans code." },
              { title: "−10 % dès 10 pièces", text: "Par référence et par taille." },
              { title: "−15 % dès 25 pièces", text: "Tarif revendeur le plus bas." },
              { title: "Support", text: "Visuels, fiches et conseils WhatsApp." },
            ].map((item) => (
              <div key={item.title} className="rounded-md border border-white/10 p-4">
                <h3 className="text-[13px] font-semibold">{item.title}</h3>
                <p className="mt-1 text-[11.5px] leading-relaxed text-white/50">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
