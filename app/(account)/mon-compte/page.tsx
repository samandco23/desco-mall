import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Package, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import { customerStats, getCustomerOrders } from "@/lib/account";
import { auth } from "@/lib/auth";
import { DEMO_CLIENT } from "@/lib/demo-data";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Client DESCO";
  const email = session?.user?.email ?? "";
  const orders = await getCustomerOrders(email, session?.user?.id ?? "", name);
  const stats = customerStats(orders);
  const lastOrder = stats.lastOrder;
  const firstName = name.split(" ")[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Vue d&apos;ensemble</p>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-0.03em]">
            Bonjour, {firstName}.
          </h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            Voici l&apos;état de votre compte DESCO MALL.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/catalogue">
            Continuer mes achats <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Package, label: "Commandes", value: String(stats.orderCount), hint: "depuis la création du compte" },
          { icon: Sparkles, label: "En cours", value: String(stats.activeCount), hint: "préparation ou livraison" },
          { icon: Wallet, label: "Total dépensé", value: formatPrice(stats.totalSpent), hint: "commandes payées" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-md border border-ink-line p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] font-medium text-ink-muted">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-ink-faint" />
            </div>
            <p className="mt-2 text-[22px] font-bold tracking-[-0.02em]">{stat.value}</p>
            <p className="mt-0.5 text-[10.5px] text-ink-faint">{stat.hint}</p>
          </div>
        ))}
      </div>

      {lastOrder ? (
        <section className="mt-6 rounded-lg border border-ink-line">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">Dernière commande</h2>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                {lastOrder.orderNumber} · {formatDate(lastOrder.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={lastOrder.status} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[13px]">
                {lastOrder.items.length} article{lastOrder.items.length > 1 ? "s" : ""} ·{" "}
                <span className="font-semibold">{formatPrice(lastOrder.total)}</span>
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                Livraison à {lastOrder.city}
                {lastOrder.neighborhood ? `, ${lastOrder.neighborhood}` : ""}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/mes-commandes/${lastOrder.id}`}>Suivre ma commande</Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-lg border border-ink-line p-6">
          <h2 className="text-[15px] font-semibold">Votre première commande vous attend</h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Parcourez la sélection et payez avec MTN Mobile Money ou Orange Money.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/catalogue">Découvrir le catalogue</Link>
          </Button>
        </section>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <section className="rounded-lg border border-ink-line p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink-soft" />
            <h2 className="text-[14px] font-semibold">Adresse de livraison</h2>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
            {name}
            <br />
            {DEMO_CLIENT.neighborhood}, {DEMO_CLIENT.city}
            <br />
            {DEMO_CLIENT.phone}
          </p>
          <Link
            href="/mes-informations"
            className="mt-3 inline-block text-[12px] underline underline-offset-4 hover:text-brand-black"
          >
            Modifier mes informations
          </Link>
        </section>

        <section className="rounded-lg border border-ink-line p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ink-soft" />
            <h2 className="text-[14px] font-semibold">Une question sur une commande ?</h2>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
            Notre équipe répond sur WhatsApp du lundi au samedi, de 8 h à 19 h. Munissez-vous
            de votre numéro de commande.
          </p>
          <a
            href="https://wa.me/237655000000"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-[12px] underline underline-offset-4 hover:text-brand-black"
          >
            Écrire sur WhatsApp
          </a>
        </section>
      </div>

      <p className="mt-6 text-[11px] text-ink-faint">
        Compte créé le {formatDate(DEMO_CLIENT.memberSince)} · {email}
      </p>
    </div>
  );
}
