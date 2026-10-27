"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";

export default function WishlistPage() {
  const mounted = useMounted();
  const items = useWishlistStore((state) => state.items);
  const remove = useWishlistStore((state) => state.remove);

  if (!mounted) {
    return (
      <div className="container-shop py-10">
        <h1 className="text-[28px] font-bold tracking-[-0.03em]">Mes favoris</h1>
        <div className="mt-10 h-40 animate-pulse rounded-lg bg-paper-soft" />
      </div>
    );
  }

  return (
    <div className="container-shop py-8 md:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Votre sélection</p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em]">Mes favoris</h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {items.length > 0
              ? `${items.length} pièce${items.length > 1 ? "s" : ""} sauvegardée${items.length > 1 ? "s" : ""}.`
              : "Vos coups de cœur, gardés de côté."}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori pour le moment"
            description="Touchez le cœur sur une pièce pour la retrouver ici, même après avoir fermé la boutique."
            actionLabel="Parcourir le catalogue"
            actionHref="/catalogue"
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
            {items.map((item) => (
              <article key={item.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-paper-tint">
                  <Link href={`/produit/${item.slug}`} aria-label={item.name}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 280px"
                      className="object-cover"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Retirer ${item.name} des favoris`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-soft backdrop-blur-[3px] transition-colors hover:text-brand-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="mt-3 text-[13.5px] font-medium">
                  <Link href={`/produit/${item.slug}`} className="hover:underline">
                    {item.name}
                  </Link>
                </h2>
                <p className="mt-1 text-[14px] font-bold">{formatPrice(item.price)}</p>
              </article>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/catalogue">Continuer mes achats</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
