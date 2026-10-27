"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";

import { CartDrawer } from "@/components/shop/cart-drawer";
import { Logo } from "@/components/shared/logo";
import { useCartCount } from "@/hooks/use-cart";
import { useMounted } from "@/hooks/use-mounted";
import { cn, initials } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

const NAV_LINKS = [
  { label: "Nouveautés", href: "/catalogue?nouveautes=1" },
  { label: "Femme", href: "/catalogue/femme" },
  { label: "Homme", href: "/catalogue/homme" },
  { label: "Enfants", href: "/catalogue/enfants" },
  { label: "Accessoires", href: "/catalogue/accessoires" },
  { label: "Grossiste", href: "/a-propos#distributeurs" },
  { label: "Soldes", href: "/catalogue?promo=1", accent: true },
];

const QUICK_SEARCHES = ["Robe Sawa", "Ensemble Bonanjo", "Wax", "Chemise lin"];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const mounted = useMounted();
  const cartCount = useCartCount();
  const openCart = useCartStore((state) => state.openCart);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/recherche?q=${encodeURIComponent(value)}`);
  }

  const accountHref = session?.user ? "/mon-compte" : "/connexion";

  return (
    <>
      <div className="bg-brand-black text-white">
        <div className="container-shop flex h-[38px] items-center justify-between gap-4 text-[11.5px] font-medium">
          <p className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" />
            <span>Livraison à Douala & Yaoundé sous 48 h</span>
          </p>
          <p className="hidden text-white/70 sm:block">
            Paiement MTN Mobile Money & Orange Money
          </p>
          <a
            href="https://wa.me/237655000000"
            target="_blank"
            rel="noreferrer"
            className="hidden text-white/70 transition-colors hover:text-white md:block"
          >
            WhatsApp +237 655 000 000
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-ink-line bg-white">
        <div className="container-shop flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="flex h-10 w-10 items-center justify-center rounded-sm text-brand-black transition-colors hover:bg-paper-tint min-[950px]:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
          </div>

          <nav
            aria-label="Navigation principale"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 min-[950px]:flex"
          >
            {NAV_LINKS.map((link) => {
              const active =
                !link.href.includes("?") && pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap border-b-2 border-transparent pb-1 pt-1 text-[13.5px] font-medium transition-colors hover:text-brand-black",
                    active ? "border-brand-black text-brand-black" : "text-ink-muted",
                    link.accent && "text-brand-accent hover:text-brand-accent"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Rechercher un produit"
              aria-expanded={searchOpen}
              className="flex h-10 w-10 items-center justify-center rounded-sm text-brand-black transition-colors hover:bg-paper-tint"
            >
              <Search className="h-[19px] w-[19px]" />
            </button>

            <Link
              href={accountHref}
              aria-label={session?.user ? "Mon compte" : "Se connecter"}
              className="flex h-10 w-10 items-center justify-center rounded-sm text-brand-black transition-colors hover:bg-paper-tint"
            >
              {session?.user?.name ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-black text-[10px] font-bold text-white">
                  {initials(session.user.name)}
                </span>
              ) : (
                <User className="h-[19px] w-[19px]" />
              )}
            </Link>

            <Link
              href="/favoris"
              aria-label="Mes favoris"
              className="relative hidden h-10 w-10 items-center justify-center rounded-sm text-brand-black transition-colors hover:bg-paper-tint sm:flex"
            >
              <Heart className="h-[19px] w-[19px]" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-black px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label="Ouvrir le panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-sm text-brand-black transition-colors hover:bg-paper-tint"
            >
              <ShoppingBag className="h-[19px] w-[19px]" />
              {mounted && cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-ink-line bg-white">
            <div className="container-shop py-4">
              <form onSubmit={submitSearch} className="flex items-center gap-3">
                <Search className="h-5 w-5 shrink-0 text-ink-faint" />
                <input
                  ref={searchInput}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  placeholder="Rechercher une robe, un ensemble, une taille…"
                  aria-label="Rechercher dans la boutique"
                  className="h-10 w-full border-0 bg-transparent text-[15px] text-brand-black placeholder:text-ink-faint focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Fermer la recherche"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-ink-soft hover:bg-paper-soft"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
                <span className="text-[11.5px] text-ink-faint">Recherches fréquentes :</span>
                {QUICK_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => router.push(`/recherche?q=${encodeURIComponent(term)}`)}
                    className="rounded-sm bg-paper-soft px-2.5 py-1 text-[11.5px] text-ink-soft transition-colors hover:bg-paper-tint hover:text-brand-black"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-white lg:hidden">
          <div className="container-shop flex h-16 items-center justify-between border-b border-ink-line">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="flex h-10 w-10 items-center justify-center rounded-sm hover:bg-paper-tint"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="container-shop flex-1 overflow-y-auto py-6" aria-label="Menu mobile">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block py-3 text-[22px] font-semibold tracking-[-0.02em]",
                      link.accent ? "text-brand-accent" : "text-brand-black"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-3 border-t border-ink-line pt-6">
              <Link
                href={accountHref}
                onClick={() => setMenuOpen(false)}
                className="block text-[14px] font-medium text-brand-black"
              >
                {session?.user ? "Mon compte" : "Se connecter / Créer un compte"}
              </Link>
              <Link
                href="/favoris"
                onClick={() => setMenuOpen(false)}
                className="block text-[14px] font-medium text-brand-black"
              >
                Mes favoris
              </Link>
              <Link
                href="/panier"
                onClick={() => setMenuOpen(false)}
                className="block text-[14px] font-medium text-brand-black"
              >
                Mon panier
              </Link>
            </div>
          </nav>
          <div className="container-shop border-t border-ink-line py-4 text-[11.5px] text-ink-muted">
            Douala, Cameroun · WhatsApp +237 655 000 000
          </div>
        </div>
      )}

      <CartDrawer />
    </>
  );
}
