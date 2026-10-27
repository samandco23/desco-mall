"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { StarRating } from "@/components/shared/star-rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CatalogProduct } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const REVIEWS = [
  {
    name: "Clarisse M.",
    city: "Douala",
    rating: 5,
    date: "2026-10-08T10:00:00.000Z",
    text: "La coupe tombe exactement comme sur les photos. J'ai reçu ma commande en deux jours à Akwa, le livreur m'a appelée avant de passer.",
  },
  {
    name: "Nadège T.",
    city: "Yaoundé",
    rating: 4,
    date: "2026-09-24T10:00:00.000Z",
    text: "Très belle finition, le tissu est léger et ne colle pas. Je conseille de prendre sa taille habituelle, la coupe est fidèle.",
  },
];

export function ProductTabs({ product }: { product: CatalogProduct }) {
  return (
    <Tabs defaultValue="description">
      <TabsList aria-label="Informations produit">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="livraison">Livraison & retours</TabsTrigger>
        <TabsTrigger value="avis">Avis ({product.reviewCount})</TabsTrigger>
      </TabsList>

      <TabsContent value="description">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h2 className="text-[18px] font-semibold">Ce qu&apos;il faut savoir</h2>
            <div className="prose-shop mt-3">
              <p>{product.description}</p>
            </div>
            <ul className="mt-5 space-y-2.5">
              {product.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2.5 text-[13px] text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper-tint">
                    <Check className="h-3 w-3 text-brand-black" />
                  </span>
                  {detail}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] text-ink-faint">
              Référence : {product.id.replace("prod_", "DM-").toUpperCase()} · Catégorie :{" "}
              <Link href={`/catalogue/${product.category.slug}`} className="underline underline-offset-4">
                {product.category.name}
              </Link>
            </p>
          </div>
          {product.images[1] && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-tint md:aspect-[4/3]">
              <Image
                src={product.images[1].url}
                alt={product.images[1].alt}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="livraison">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <h2 className="text-[18px] font-semibold">Livraison</h2>
            <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-ink-muted">
              <p>
                <strong className="text-brand-black">Douala et Yaoundé :</strong> livraison en
                48 h ouvrées, frais de 1 000 à 1 500 XAF selon la ville.
              </p>
              <p>
                <strong className="text-brand-black">Villes secondaires :</strong> 2 à 4 jours
                ouvrés via nos partenaires transporteurs (Bafoussam, Bamenda, Garoua, Kribi,
                Buea, Limbé, Ngaoundéré…).
              </p>
              <p>
                <strong className="text-brand-black">Paiement :</strong> MTN Mobile Money ou
                Orange Money. Vous recevez une confirmation par email dès réception du paiement.
              </p>
            </div>
            <h2 className="mt-7 text-[18px] font-semibold">Retours & échanges</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              Vous disposez de 7 jours après réception pour demander un échange ou un
              remboursement, si la pièce n&apos;a pas été portée et que l&apos;étiquette est
              intacte. Écrivez-nous sur WhatsApp avec votre numéro de commande.
            </p>
            <p className="mt-4">
              <Link href="/aide#retours" className="text-[13px] underline underline-offset-4">
                Lire la politique de retour complète
              </Link>
            </p>
          </div>
          <div className="rounded-lg bg-paper-soft p-6">
            <h2 className="text-[15px] font-semibold">Guide des tailles</h2>
            <table className="mt-4 w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-ink-line text-[11px] text-ink-muted">
                  <th className="pb-2 font-medium">Taille</th>
                  <th className="pb-2 font-medium">Poitrine</th>
                  <th className="pb-2 font-medium">Taille</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-line/70">
                {[
                  ["XS", "80–84 cm", "60–64 cm"],
                  ["S", "85–89 cm", "65–69 cm"],
                  ["M", "90–94 cm", "70–74 cm"],
                  ["L", "95–100 cm", "75–80 cm"],
                  ["XL", "101–106 cm", "81–86 cm"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell) => (
                      <td key={cell} className="py-2 text-ink-muted">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-ink-faint">
              Mesures indicatives. En cas d&apos;hésitation, prenez la taille au-dessus.
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="avis">
        <div className="grid gap-8 md:grid-cols-[260px_1fr] md:gap-12">
          <div>
            <div className="rounded-lg border border-ink-line p-5">
              <p className="text-[38px] font-bold leading-none">{product.rating.toFixed(1)}</p>
              <StarRating rating={product.rating} className="mt-2" compact />
              <p className="mt-2 text-[12px] text-ink-muted">
                Basé sur {product.reviewCount} avis clients vérifiés
              </p>
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">
              Les avis sont collectés après livraison. Nous ne supprimons pas les avis négatifs.
            </p>
          </div>
          <div className="divide-y divide-ink-line">
            {REVIEWS.map((review) => (
              <article key={review.name} className="py-4 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold">
                    {review.name} <span className="font-normal text-ink-faint">· {review.city}</span>
                  </p>
                  <span className="text-[11.5px] text-ink-faint">{formatDate(review.date)}</span>
                </div>
                <StarRating rating={review.rating} className="mt-1" compact />
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{review.text}</p>
              </article>
            ))}
            {REVIEWS.length === 0 && (
              <p className="text-[13px] text-ink-muted">Soyez le premier à donner votre avis.</p>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
