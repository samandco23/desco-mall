"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FolderTree,
  LayoutGrid,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { signOutAction } from "@/lib/actions/auth";
import { cn, initials } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Pilotage",
    links: [
      { href: "/admin", label: "Tableau de bord", icon: BarChart3 },
      { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
    ],
  },
  {
    title: "Catalogue",
    links: [
      { href: "/admin/produits", label: "Produits", icon: Package },
      { href: "/admin/categories", label: "Catégories", icon: FolderTree },
      { href: "/admin/stock", label: "Stock", icon: Boxes },
    ],
  },
  {
    title: "Clients",
    links: [{ href: "/admin/clients", label: "Clients", icon: Users }],
  },
  {
    title: "Réglages",
    links: [{ href: "/admin/parametres", label: "Paramètres", icon: Settings }],
  },
];

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col bg-brand-black text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo invert />
          <span className="ml-2 rounded-sm bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/60">
            admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigation administration">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="mb-2 px-2 text-[10px] font-semibold tracking-[0.04em] text-white/35">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] transition-colors",
                        isActive(link.href)
                          ? "bg-white/10 font-medium text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="mb-3 flex items-center gap-2 rounded-sm px-2.5 py-2 text-[12px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" /> Voir la boutique
          </Link>
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
              {initials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium">{name}</p>
              <p className="truncate text-[10px] text-white/40">{email}</p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Se déconnecter"
                className="flex h-8 w-8 items-center justify-center rounded-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="border-b border-ink-line bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="text-[12px] font-semibold">Administration</span>
          </div>
          <Link
            href="/"
            className="text-[11px] text-ink-muted underline underline-offset-4"
          >
            Voir la boutique
          </Link>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto no-scrollbar" aria-label="Navigation administration mobile">
          {SECTIONS.flatMap((section) => section.links).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11.5px]",
                isActive(link.href)
                  ? "bg-brand-black text-white"
                  : "bg-paper-soft text-ink-muted"
              )}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
