"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Lock, ShoppingBag, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { QuantityControl } from "@/components/shared/quantity-control";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { formatPrice } from "@/lib/utils";
import { unitPriceFor } from "@/lib/wholesale";
import { cartSubtotal, useCartStore } from "@/store/cart-store";

export function CartView() {
  const mounted = useMounted();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (!mounted) {
    return (
      <div className="container-shop py-10">
        <div className="h-48 animate-pulse rounded-lg bg-paper-soft" />
      </div>
    );
  }

  const subtotal = cartSubtotal(items);

  if (items.length === 0) {
    return (
      <div className="container-shop py-10 md:py-14">
        <h1 className="text-[28px] font-bold tracking-[-0.03em]">Mon panier</h1>
        <div className="mt-8">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            description="Parcourez les nouveautés et ajoutez vos pièces favorites. Votre panier est conservé même si vous fermez la boutique."
            actionLabel="Découvrir le catalogue"
            actionHref="/catalogue"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-shop py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Étape 1 sur 3</p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">Mon panier</h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {items.length} article{items.length > 1 ? "s" : ""} · prix en XAF, taxes incluses
          </p>
        </div>
        <Link
          href="/catalogue"
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted underline-offset-4 hover:text-brand-black hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Continuer mes achats
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div>
          <ul className="divide-y divide-ink-line border-y border-ink-line">
            {items.map((item) => {
              const lineUnitPrice = unitPriceFor(item.price, item.quantity);
              const hasTierDiscount = lineUnitPrice < item.price;
              return (
              <li key={item.key} className="flex gap-4 py-5">
                <Link
                  href={`/produit/${item.slug}`}
                  className="relative h-[132px] w-[104px] shrink-0 overflow-hidden rounded-sm bg-paper-tint"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="104px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/produit/${item.slug}`}
                        className="text-[14px] font-medium leading-snug hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[12px] text-ink-muted">
                        Taille : {item.size} · Couleur : {item.color}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-faint">
                        {hasTierDiscount ? (
                          <>
                            <span className="line-through">{formatPrice(item.price)}</span>{" "}
                            <span className="font-semibold text-brand-success">
                              {formatPrice(lineUnitPrice)} l&apos;unité · prix grossiste
                            </span>
                          </>
                        ) : (
                          <>{formatPrice(item.price)} l&apos;unité</>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      aria-label={`Retirer ${item.name} du panier`}
                      className="shrink-0 text-ink-faint transition-colors hover:text-brand-accent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <QuantityControl
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.key, value)}
                      max={item.maxQuantity}
                      compact
                    />
                    <span className="text-[15px] font-bold">
                      {formatPrice(lineUnitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
              );
            })}
          </ul>

        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border border-ink-line bg-white p-5">
            <h2 className="text-[15px] font-semibold">Récapitulatif</h2>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Sous-total</dt>
                <dd className="font-semibold">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Livraison</dt>
                <dd className="text-ink-muted">Calculée au paiement</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-ink-line pt-3 text-[15px]">
                <dt className="font-semibold">Total estimé</dt>
                <dd className="font-bold">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <Button asChild className="mt-5 w-full">
              <Link href="/checkout">Passer commande</Link>
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[10.5px] text-ink-faint">
              <Lock className="h-3 w-3" /> MTN Mobile Money · Orange Money · sécurisé
            </p>
          </div>
          <ul className="mt-4 space-y-2 px-1 text-[11.5px] text-ink-muted">
            <li>Livraison à Douala et Yaoundé en 48 h.</li>
            <li>Retours gratuits sous 7 jours (pièce non portée).</li>
            <li>Une question ? WhatsApp +237 655 000 000.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
