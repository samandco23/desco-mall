import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAdminOrders } from "@/lib/admin-data";
import { ORDER_STATUS_LABELS } from "@/components/shared/order-status-badge";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Commandes",
  robots: { index: false },
};

const HIGHLIGHTED: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED"];

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  const counts = orders.reduce<Record<string, number>>((accumulator, order) => {
    accumulator[order.status] = (accumulator[order.status] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <div>
      <AdminPageHeader
        eyebrow="Pilotage"
        title="Commandes"
        description="Suivez chaque commande, du paiement Mobile Money à la livraison."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => (
          <span
            key={status}
            className={cn(
              "rounded-sm border px-2.5 py-1.5 text-[11px]",
              HIGHLIGHTED.includes(status)
                ? "border-ink-line bg-white font-semibold text-brand-black"
                : "border-ink-line bg-paper-soft text-ink-muted"
            )}
          >
            {ORDER_STATUS_LABELS[status]} · {counts[status] ?? 0}
          </span>
        ))}
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
