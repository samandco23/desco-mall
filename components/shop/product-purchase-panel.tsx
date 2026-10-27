"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Heart, Loader2, Package, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { QuantityControl } from "@/components/shared/quantity-control";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import {
  WHOLESALE_TIERS,
  nextTierAbove,
  tierForQuantity,
  unitPriceFor,
} from "@/lib/wholesale";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

function discountPercent(product: CatalogProduct): number | null {
  if (!product.comparePrice || product.comparePrice <= product.price) return null;
  return Math.round((1 - product.price / product.comparePrice) * 100);
}

export function ProductPurchasePanel({ product }: { product: CatalogProduct }) {
  const [color, setColor] = useState(product.colors[0]?.name ?? "Noir");
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] ?? null : null
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const inWishlist = useWishlistStore((state) =>
    state.items.some((item) => item.id === product.id)
  );
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const discount = discountPercent(product);
  const selectedStock = size ? product.stock[size] ?? 0 : 0;
  const totalStock = Object.values(product.stock).reduce((sum, value) => sum + value, 0);
  const activeTier = tierForQuantity(quantity);
  const upcomingTier = nextTierAbove(quantity);
  const effectiveUnitPrice = unitPriceFor(product.price, quantity);
  const hasTierDiscount = effectiveUnitPrice < product.price;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleAdd() {
    if (!size) {
      setError("Choisissez votre taille avant d'ajouter au panier.");
      return;
    }
    if (selectedStock <= 0) {
      setError("Cette taille est épuisée. Choisissez une autre taille.");
      return;
    }
    setError(null);
    setPending(true);
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url ?? "",
      price: product.price,
      size,
      color,
      quantity,
      maxQuantity: selectedStock,
    });
    window.setTimeout(() => {
      setPending(false);
      setAdded(true);
      timer.current = setTimeout(() => setAdded(false), 1800);
    }, 350);
  }

  return (
    <div>
      {product.isNew && (
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-[4px] border border-brand-accent/15 bg-brand-accent-bg px-2.5 py-1 text-[11.5px] font-semibold text-brand-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" aria-hidden="true" />
          Nouvelle arrivée
        </span>
      )}

      <h1 className="text-[26px] font-bold leading-[1.15] tracking-[-0.03em] md:text-[28px]">
        {product.name}
      </h1>

      <div className="mt-2.5">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[28px] font-bold leading-none tracking-[-0.02em] md:text-[30px]">
          {formatPrice(effectiveUnitPrice)}
        </span>
        {(product.comparePrice || hasTierDiscount) && (
          <span className="text-[18px] font-normal text-ink-faint line-through">
            {formatPrice(product.comparePrice ?? product.price)}
          </span>
        )}
        {discount && !hasTierDiscount && (
          <span className="rounded-[4px] bg-brand-accent px-2 py-1 text-[11.5px] font-bold leading-none text-white">
            −{discount} %
          </span>
        )}
        {hasTierDiscount && (
          <span className="rounded-[4px] bg-brand-success px-2 py-1 text-[11.5px] font-bold leading-none text-white">
            Prix grossiste −{Math.round((1 - effectiveUnitPrice / product.price) * 100)} %
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11.5px] text-ink-muted">
        {hasTierDiscount
          ? `Prix grossiste appliqué pour ${quantity} pièces · Livraison calculée au paiement`
          : "Prix TTC · Livraison calculée au paiement"}
      </p>

      <p className="mt-5 text-[14px] leading-[1.7] text-ink-muted">{product.description}</p>

      <div className="mt-5 rounded-md border border-ink-line bg-paper-soft/60 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <Package className="h-4 w-4 text-ink-soft" />
          Tarifs grossiste
        </p>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {WHOLESALE_TIERS.map((tier) => {
            const isActive = quantity >= tier.minQuantity;
            return (
              <li
                key={tier.minQuantity}
                className={cn(
                  "rounded-sm border px-2 py-2 text-center transition-colors",
                  isActive
                    ? "border-brand-black bg-brand-black text-white"
                    : "border-ink-line bg-white text-ink-muted"
                )}
              >
                <p className="text-[12px] font-semibold">
                  {tier.minQuantity} pièces
                </p>
                <p className="mt-0.5 text-[11px]">−{tier.discountPercent} %</p>
              </li>
            );
          })}
        </ul>
        {upcomingTier && (
          <p className="mt-2.5 text-[11.5px] text-ink-muted">
            Ajoutez {upcomingTier.minQuantity - quantity} de plus pour débloquer −
            {upcomingTier.discountPercent} % sur chaque pièce.
          </p>
        )}
      </div>

      <div className="mt-7">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold">
            Couleur : <span className="font-normal text-ink-muted">{color}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {product.colors.map((entry) => {
            const active = entry.name === color;
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => setColor(entry.name)}
                aria-label={`Couleur ${entry.name}`}
                aria-pressed={active}
                title={entry.name}
                className={cn(
                  "h-8 w-8 rounded-full border border-ink-line transition-all hover:scale-105",
                  active && "ring-2 ring-brand-black ring-offset-2"
                )}
                style={{ backgroundColor: entry.hex }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold">Taille</span>
          <a
            href="/aide#tailles"
            className="text-[12px] text-ink-muted underline underline-offset-4 hover:text-brand-black"
          >
            Guide des tailles
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((entry) => {
            const outOfStock = (product.stock[entry] ?? 0) <= 0;
            const active = entry === size;
            return (
              <button
                key={entry}
                type="button"
                disabled={outOfStock}
                onClick={() => {
                  setSize(entry);
                  setQuantity(1);
                  setError(null);
                }}
                aria-pressed={active}
                className={cn(
                  "flex h-10 min-w-[52px] items-center justify-center rounded-sm border-[1.5px] px-3.5 text-[13.5px] font-medium transition-colors",
                  active
                    ? "border-brand-black bg-brand-black text-white"
                    : "border-ink-line bg-white text-brand-black hover:border-ink-faint",
                  outOfStock &&
                    "cursor-not-allowed border-ink-line text-ink-faint line-through hover:border-ink-line"
                )}
              >
                {entry}
              </button>
            );
          })}
        </div>
        {size && selectedStock > 0 && selectedStock <= 5 && (
          <p className="mt-2.5 text-[12px] font-medium text-brand-accent">
            Plus que {selectedStock} pièce{selectedStock > 1 ? "s" : ""} en stock
          </p>
        )}
        {error && (
          <p className="mt-2.5 text-[12px] font-medium text-brand-accent" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 flex items-stretch gap-2.5">
        <QuantityControl
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, selectedStock || 10)}
          className="shrink-0"
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={pending || totalStock === 0}
          className={cn(
            "flex-1",
            added && "bg-brand-success hover:bg-brand-success"
          )}
        >
          {pending ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" /> Ajout…
            </>
          ) : added ? (
            <>
              <Check className="h-[18px] w-[18px]" /> Ajouté !
            </>
          ) : totalStock === 0 ? (
            "Épuisé"
          ) : (
            <>
              <ShoppingBag className="h-[18px] w-[18px]" /> Ajouter au panier
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={() =>
            toggleWishlist({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0]?.url ?? "",
            })
          }
          aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={inWishlist}
          className={cn(
            "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-ink-line bg-white text-ink-muted transition-colors hover:border-brand-accent hover:text-brand-accent",
            inWishlist && "border-brand-accent text-brand-accent"
          )}
        >
          <Heart className={cn("h-5 w-5", inWishlist && "fill-brand-accent")} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 divide-x divide-ink-line border-y border-ink-line py-4">
        <div className="flex flex-col items-center px-2 text-center">
          <Truck className="h-[22px] w-[22px] text-ink-soft" />
          <p className="mt-2 text-[12px] font-semibold">Livraison 48 h</p>
          <p className="mt-0.5 text-[11px] leading-[1.4] text-ink-muted">Douala & Yaoundé</p>
        </div>
        <div className="flex flex-col items-center px-2 text-center">
          <ShieldCheck className="h-[22px] w-[22px] text-ink-soft" />
          <p className="mt-2 text-[12px] font-semibold">Paiement MoMo</p>
          <p className="mt-0.5 text-[11px] leading-[1.4] text-ink-muted">MTN & Orange Money</p>
        </div>
        <div className="flex flex-col items-center px-2 text-center">
          <Check className="h-[22px] w-[22px] text-ink-soft" />
          <p className="mt-2 text-[12px] font-semibold">Retours 7 jours</p>
          <p className="mt-0.5 text-[11px] leading-[1.4] text-ink-muted">Échange simple</p>
        </div>
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
        Livraison à domicile sous 48 h à Douala et Yaoundé. Paiement à la livraison possible
        sur demande.
      </p>
    </div>
  );
}
