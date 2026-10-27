import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Smartphone } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { PrintButton } from "@/components/admin/print-button";
import {
  OrderStatusBadge,
  ORDER_STATUS_LABELS,
  paymentMethodLabel,
} from "@/components/shared/order-status-badge";
import { getAdminOrder } from "@/lib/admin-data";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Détail commande",
  robots: { index: false },
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = getAdminOrder(params.id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/commandes"
        className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted transition-colors hover:text-brand-black"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Toutes les commandes
      </Link>

      <AdminPageHeader
        eyebrow={`Commande du ${formatDate(order.createdAt, true)}`}
        title={order.orderNumber}
        action={
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PrintButton />
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <div className="space-y-4">
          <section className="rounded-md border border-ink-line bg-white">
            <div className="flex items-center justify-between border-b border-ink-line px-4 py-3">
              <h2 className="text-[13.5px] font-semibold">Articles</h2>
              <span className="text-[11px] text-ink-muted">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} pièce(s)
              </span>
            </div>
            <ul className="divide-y divide-ink-line">
              {order.items.map((item, index) => (
                <li key={`${item.productName}-${index}`} className="flex items-center gap-3 px-4 py-3">
                  {item.imageUrl && (
                    <div className="relative h-[64px] w-[50px] shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="50px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium">{item.productName}</p>
                    <p className="mt-0.5 text-[10.5px] text-ink-muted">
                      {item.variantInfo} · {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-[12.5px] font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-ink-line px-4 py-3 text-[12px]">
              <div className="flex justify-between text-ink-muted">
                <span>Sous-total</span>
                <span>{formatPrice(order.total - order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Livraison — {order.city}</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-line pt-2 text-[14px] font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-ink-line bg-white p-4">
            <h2 className="text-[13.5px] font-semibold">Historique</h2>
            <ol className="mt-3 space-y-3">
              {order.timeline.map((entry, index) => (
                <li key={`${entry.status}-${index}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2 w-2 rounded-full bg-brand-black" />
                    {index < order.timeline.length - 1 && (
                      <span className="my-1 h-full w-px bg-ink-line" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-[12px] font-medium">
                      {ORDER_STATUS_LABELS[entry.status]}
                    </p>
                    {entry.note && (
                      <p className="mt-0.5 text-[11px] text-ink-muted">{entry.note}</p>
                    )}
                    <p className="mt-0.5 text-[10px] text-ink-faint">
                      {formatDate(entry.at, true)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-md border border-ink-line bg-white p-4">
            <h2 className="text-[13px] font-semibold">Client</h2>
            <p className="mt-2 text-[12.5px] font-medium">{order.customerName}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-muted">
              <Phone className="h-3 w-3" /> {order.customerPhone}
            </p>
            <p className="mt-1 text-[11px] text-ink-muted">{order.customerEmail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-ink-line px-2.5 py-1.5 text-[10.5px] font-medium transition-colors hover:border-ink-faint"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${order.customerEmail}`}
                className="rounded-sm border border-ink-line px-2.5 py-1.5 text-[10.5px] font-medium transition-colors hover:border-ink-faint"
              >
                Email
              </a>
            </div>
          </section>

          <section className="rounded-md border border-ink-line bg-white p-4">
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold">
              <MapPin className="h-3.5 w-3.5" /> Livraison
            </h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
              {order.neighborhood}, {order.city}
              <br />
              Cameroun
            </p>
            <h3 className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold">
              <Smartphone className="h-3.5 w-3.5" /> Paiement
            </h3>
            <p className="mt-2 text-[11.5px] text-ink-muted">
              {paymentMethodLabel(order.paymentMethod)}
              <br />
              Statut : {order.paymentStatus === "PAID" ? "payé" : order.paymentStatus.toLowerCase()}
            </p>
          </section>

          <OrderStatusForm orderId={order.id} currentStatus={order.status} />

          <section className="rounded-md bg-paper-soft p-4">
            <p className="text-[11px] leading-relaxed text-ink-muted">
              Les statuts « Expédiée » et « Livrée » déclenchent un email client lorsque Brevo
              est configuré. L&apos;impression du bon utilise la boîte de dialogue du navigateur.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
