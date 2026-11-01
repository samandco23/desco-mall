"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";

import type { CatalogProduct } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";

function discountPercent(product: CatalogProduct): number | null {
  if (!product.comparePrice || product.comparePrice <= product.price) return null;
  return Math.round((1 - product.price / product.comparePrice) * 100);
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const inWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.id === product.id)
  );
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const discount = discountPercent(product);
  const soldOut =
    Object.values(product.stock).reduce((sum, value) => sum + value, 0) === 0;
  const primary = product.images[0];
  const secondary = product.images[1] ?? primary;

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper-tint">
        <Link
          href={`/produit/${product.slug}`}
          className="block h-full w-full"
          aria-label={product.name}
        >
          {primary && (
            <Image
              src={primary.url}
              alt={primary.alt}
              fill
              sizes="(max-width: 520px) 50vw, (max-width: 900px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className={cn(
                "object-cover transition-all duration-500",
                secondary && "group-hover:opacity-0",
                soldOut && "opacity-60"
              )}
            />
          )}
          {secondary && secondary.url !== primary?.url && (
            <Image
              src={secondary.url}
              alt={secondary.alt}
              fill
              sizes="(max-width: 520px) 50vw, (max-width: 900px) 33vw, (max-width: 1280px) 25vw, 20vw"
              className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isNew && (
            <span className="rounded-[4px] bg-brand-black px-2.5 py-1 text-[11px] font-semibold leading-none text-white">
              Nouveau
            </span>
          )}
          {discount && (
            <span className="rounded-[4px] bg-brand-accent px-2 py-1 text-[11.5px] font-bold leading-none text-white">
              −{discount} %
            </span>
          )}
          {soldOut && (
            <span className="rounded-[4px] bg-white px-2.5 py-1 text-[11px] font-semibold leading-none text-ink-muted">
              Épuisé
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            toggleWishlist({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: primary?.url ?? "",
            })
          }
          aria-label={
            inWishlist
              ? `Retirer ${product.name} des favoris`
              : `Ajouter ${product.name} aux favoris`
          }
          aria-pressed={inWishlist}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-soft backdrop-blur-[3px] transition-colors hover:text-brand-accent",
            inWishlist && "text-brand-accent"
          )}
        >
          <Heart className={cn("h-4 w-4", inWishlist && "fill-brand-accent")} />
        </button>

        <Link
          href={`/produit/${product.slug}`}
          aria-label={`Voir ${product.name}`}
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-black shadow-floating transition-transform hover:scale-105"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

        <div className="mt-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-[13px] font-medium leading-snug text-brand-black">
            <Link href={`/produit/${product.slug}`} className="hover:underline hover:underline-offset-2">
              {product.name}
            </Link>
          </h3>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-2.5 w-2.5 rounded-full border border-ink-line"
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-[13px] font-bold text-brand-black">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-[12px] text-ink-faint line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
