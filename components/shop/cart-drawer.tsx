"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantityControl } from "@/components/shared/quantity-control";
import { useMounted } from "@/hooks/use-mounted";
import { formatPrice } from "@/lib/utils";
import { unitPriceFor } from "@/lib/wholesale";
import { cartSubtotal, useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const pathname = usePathname();
  const mounted = useMounted();
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!mounted || !isOpen) return null;

  const subtotal = cartSubtotal(items);
  const total = subtotal;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Panier">
      <button
        type="button"
        aria-label="Fermer le panier"
        onClick={closeCart}
        className="absolute inset-0 bg-brand-black/35"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[420px] animate-slide-in flex-col bg-white shadow-floating">
        <div className="flex items-center justify-between border-b border-ink-line px-5 py-4">
          <h2 className="text-[15px] font-semibold">
            Mon panier {items.length > 0 && <span className="text-ink-muted">({items.length})</span>}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-paper-soft"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-paper-soft">
              <ShoppingBag className="h-6 w-6 text-ink-soft" />
            </span>
            <p className="text-[16px] font-semibold">Votre panier est vide</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              Découvrez les nouvelles pièces de la saison et ajoutez vos coups de cœur.
            </p>
            <Button asChild className="mt-6" size="sm">
              <Link href="/catalogue" onClick={closeCart}>
                Voir le catalogue
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-ink-line px-5 py-3">
              <p className="text-[11.5px] text-ink-muted">Frais de livraison calculés à l’étape de paiement.</p>
            </div>

            <ul className="flex-1 divide-y divide-ink-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 py-4">
                  <Link
                    href={`/produit/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-[92px] w-[72px] shrink-0 overflow-hidden rounded-sm bg-paper-tint"
                  >
                    <Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/produit/${item.slug}`}
                        onClick={closeCart}
                        className="text-[13px] font-medium leading-snug hover:underline"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Retirer ${item.name} du panier`}
                        className="shrink-0 text-ink-faint transition-colors hover:text-brand-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-[11.5px] text-ink-muted">
                      {item.size} · {item.color}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <QuantityControl
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.key, value)}
                        max={item.maxQuantity}
                        compact
                      />
                      <span className="text-[13px] font-semibold">
                        {formatPrice(unitPriceFor(item.price, item.quantity) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-ink-line px-5 py-4">
              <div className="flex items-center justify-between text-[13px] text-ink-muted">
                <span>Sous-total</span>
                <span className="font-semibold text-brand-black">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-[11px] text-ink-faint">
                Frais de livraison calculés au paiement.
              </p>
              <div className="mt-4 grid gap-2">
                <Button asChild>
                  <Link href="/checkout" onClick={closeCart}>
                    Passer commande
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/panier" onClick={closeCart}>
                    Voir le panier
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-center text-[10.5px] text-ink-faint">
                Total estimé : {formatPrice(total)} · Paiement Mobile Money sécurisé
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
