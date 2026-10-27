import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { OrderStatusBadge } from "@/components/shared/order-status-badge";
import { getCustomerOrders } from "@/lib/account";
import { auth } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mes commandes",
  robots: { index: false },
};

export default async function OrdersPage() {
  const session = await auth();
  const name = session?.user?.name ?? "Client DESCO";
  const orders = await getCustomerOrders(
    session?.user?.email ?? "",
    session?.user?.id ?? "",
    name
  );

  return (
    <div>
      <p className="eyebrow">Historique</p>
      <h1 className="mt-2 text-[26px] font-bold tracking-[-0.03em]">Mes commandes</h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        {orders.length > 0
          ? `${orders.length} commande${orders.length > 1 ? "s" : ""} enregistrée${orders.length > 1 ? "s" : ""}.`
          : "Toutes vos commandes apparaîtront ici."}
      </p>

      <div className="mt-7">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucune commande pour le moment"
            description="Votre première commande sera suivie ici, du paiement à la livraison."
            actionLabel="Découvrir le catalogue"
            actionHref="/catalogue"
          />
        ) : (
          <ul className="divide-y divide-ink-line border-y border-ink-line">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/mes-commandes/${order.id}`}
                  className="grid gap-4 py-5 transition-colors hover:bg-paper-soft/60 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden gap-1 sm:flex">
                      {order.items.slice(0, 3).map((item, index) =>
                        item.imageUrl ? (
                          <div
                            key={`${item.productName}-${index}`}
                            className="relative h-[64px] w-[50px] overflow-hidden rounded-sm bg-paper-tint"
                          >
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              fill
                              sizes="50px"
                              className="object-cover"
                            />
                          </div>
                        ) : null
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13.5px] font-semibold">{order.orderNumber}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-[12px] text-ink-muted">
                        {formatDate(order.createdAt)} · {order.items.length} article
                        {order.items.length > 1 ? "s" : ""} · {formatPrice(order.total)}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-ink-faint">
                        {order.items.map((item) => item.productName).join(", ")}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[12px] font-medium text-ink-muted sm:justify-end">
                    Voir le détail <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
