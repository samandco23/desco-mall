import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Package,
  Receipt,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatsCard } from "@/components/admin/stats-card";
import { OrderStatusBadge, ORDER_STATUS_LABELS } from "@/components/shared/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOrders, getAdminStats, getRevenueSeries } from "@/lib/admin-data";
import { formatDate, formatNumber, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false },
};

export default async function AdminDashboardPage() {
  const [stats, allOrders, revenueSeries] = await Promise.all([getAdminStats(), getAdminOrders(), getRevenueSeries(30)]);
  const recentOrders = allOrders.slice(0, 6);
  const revenue30 = revenueSeries.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Pilotage"
        title="Tableau de bord"
        description="Vue d'ensemble des ventes, des commandes et du stock DESCO MALL."
        action={
          <Button asChild size="sm">
            <Link href="/admin/produits/nouveau">Nouveau produit</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="CA du mois"
          value={formatPrice(stats.revenueThisMonth)}
          growth={stats.revenueGrowth}
          hint="vs mois dernier"
          icon={Wallet}
        />
        <StatsCard
          label="Commandes du mois"
          value={formatNumber(stats.monthOrders)}
          growth={stats.orderGrowth}
          hint="vs mois dernier"
          icon={ShoppingBag}
        />
        <StatsCard
          label="Panier moyen"
          value={formatPrice(stats.averageBasket)}
          hint="commandes payées"
          icon={Receipt}
        />
        <StatsCard
          label="À traiter"
          value={formatNumber(stats.ordersToProcess)}
          hint={`${stats.lowStockCount} alertes stock`}
          icon={AlertTriangle}
          accent
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-md border border-ink-line bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold">Chiffre d&apos;affaires</h2>
              <p className="mt-0.5 text-[11px] text-ink-muted">30 derniers jours</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-bold">{formatPrice(revenue30)}</p>
              <p className="text-[10.5px] text-ink-faint">commandes payées</p>
            </div>
          </div>
          <div className="mt-3">
            <RevenueChart data={revenueSeries} />
          </div>
        </section>

        <section className="rounded-md border border-ink-line bg-white p-4">
          <h2 className="text-[14px] font-semibold">Commandes par statut</h2>
          <p className="mt-0.5 text-[11px] text-ink-muted">Toutes périodes confondues</p>
          <ul className="mt-4 space-y-3">
            {(Object.keys(ORDER_STATUS_LABELS) as Array<keyof typeof ORDER_STATUS_LABELS>).map(
              (status) => {
                const count = stats.statusCounts[status];
                const percent = stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0;
                return (
                  <li key={status}>
                    <div className="flex items-center justify-between gap-3 text-[11.5px]">
                      <span className="text-ink-muted">{ORDER_STATUS_LABELS[status]}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-paper-tint">
                      <div
                        className={
                          status === "CANCELLED"
                            ? "h-full rounded-full bg-brand-accent"
                            : "h-full rounded-full bg-brand-black"
                        }
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                );
              }
            )}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-5 w-full">
            <Link href="/admin/commandes">Gérer les commandes</Link>
          </Button>
        </section>
      </div>

      <section className="mt-4 rounded-md border border-ink-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-ink-line px-4 py-3">
          <div>
            <h2 className="text-[14px] font-semibold">Dernières commandes</h2>
            <p className="mt-0.5 text-[11px] text-ink-muted">Les 6 commandes les plus récentes</p>
          </div>
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-1 text-[11.5px] font-medium underline-offset-4 hover:underline"
          >
            Tout voir <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>
                  <p className="text-[12.5px]">{order.customerName}</p>
                  <p className="text-[10.5px] text-ink-faint">{order.customerEmail}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-ink-muted">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-ink-muted">{order.city}</TableCell>
                <TableCell className="whitespace-nowrap font-semibold">
                  {formatPrice(order.total)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/commandes/${order.id}`}
                    className="text-[11.5px] font-medium underline-offset-4 hover:underline"
                  >
                    Détail
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="rounded-md border border-ink-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-ink-line px-4 py-3">
            <div>
              <h2 className="text-[14px] font-semibold">Alertes stock</h2>
              <p className="mt-0.5 text-[11px] text-ink-muted">Variantes à 5 pièces ou moins</p>
            </div>
            <Link
              href="/admin/stock"
              className="text-[11.5px] font-medium underline-offset-4 hover:underline"
            >
              Gérer
            </Link>
          </div>
          <ul className="divide-y divide-ink-line">
            {stats.lowStock.length > 0 ? (
              stats.lowStock.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="32px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium">{item.name}</p>
                    <p className="text-[10.5px] text-ink-faint">Taille {item.size}</p>
                  </div>
                  <span
                    className={
                      item.stock === 0
                        ? "rounded-[4px] bg-brand-accent-bg px-2 py-1 text-[10px] font-semibold text-brand-accent"
                        : "rounded-[4px] bg-[#FFF7E8] px-2 py-1 text-[10px] font-semibold text-[#9A6508]"
                    }
                  >
                    {item.stock === 0 ? "Épuisé" : `${item.stock} restants`}
                  </span>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-[12px] text-ink-muted">
                Aucune alerte de stock.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-md border border-ink-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-ink-line px-4 py-3">
            <div>
              <h2 className="text-[14px] font-semibold">Top produits</h2>
              <p className="mt-0.5 text-[11px] text-ink-muted">Par chiffre d&apos;affaires généré</p>
            </div>
            <Package className="h-4 w-4 text-ink-faint" />
          </div>
          <ul className="divide-y divide-ink-line">
            {stats.topProducts.map((product, index) => (
              <li key={product.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-4 text-[11px] font-semibold text-ink-faint">{index + 1}</span>
                <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                  {product.image && (
                    <Image src={product.image} alt={product.name} fill sizes="32px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium">{product.name}</p>
                  <p className="text-[10.5px] text-ink-faint">{product.quantity} vendus</p>
                </div>
                <span className="text-[11.5px] font-semibold">{formatPrice(product.revenue)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
