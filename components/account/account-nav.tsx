"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { signOutAction } from "@/lib/actions/auth";
import { cn, initials } from "@/lib/utils";

const links = [
  { href: "/mon-compte", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/mes-commandes", label: "Mes commandes", icon: Package },
  { href: "/mes-informations", label: "Mes informations", icon: UserRound },
  { href: "/favoris", label: "Mes favoris", icon: Heart },
];

export function AccountNav({
  name,
  email,
  isAdmin,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="md:sticky md:top-24 md:h-fit">
      <div className="flex items-center gap-3 border-b border-ink-line pb-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-black text-[13px] font-bold text-white">
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-semibold">{name}</p>
          <p className="truncate text-[11.5px] text-ink-muted">{email}</p>
        </div>
      </div>

      <nav className="mt-4 flex gap-1 overflow-x-auto no-scrollbar md:flex-col" aria-label="Espace client">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/mon-compte" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-paper-soft text-brand-black"
                  : "text-ink-muted hover:bg-paper-soft hover:text-brand-black"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13px] font-medium text-ink-muted transition-colors hover:bg-paper-soft hover:text-brand-black"
          >
            <ShieldCheck className="h-4 w-4" />
            Administration
          </Link>
        )}
      </nav>

      <form action={signOutAction} className="mt-4 border-t border-ink-line pt-4">
        <button
          type="submit"
          className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:text-brand-black"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </form>
    </aside>
  );
}
