import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Smartphone } from "lucide-react";

import {
  OrderStatusBadge,
  ORDER_STATUS_LABELS,
  paymentMethodLabel,
} from "@/components/shared/order-status-badge";
import { getCustomerOrder } from "@/lib/account";
import { auth } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/utils";
import type { PaymentStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Détail de la commande",
  robots: { index: false },
};

const TIMELINE_STEPS = [
  { status: "PENDING" as const, label: "Commande reçue" },
  { status: "PAID" as const, label: "Paiement confirmé" },
  { status: "PROCESSING" as const, label: "En préparation" },
  { status: "SHIPPED" as const, label: "Expédiée" },
  { status: "DELIVERED" as const, label: "Livrée" },
];

const RANK: Record<string, number> = {
  PENDING: 1,
  PAID: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  DELIVERED: 5,
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Non payé",
  PENDING_CONFIRMATION: "En attente de confirmation",
  PAID: "Confirmé",
  FAILED: "Échec du paiement",
  REFUNDED: "Remboursé",
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const name = session?.user?.name ?? "Client DESCO";
  const order = await getCustomerOrder(
    params.id,
    session?.user?.email ?? "",
    session?.user?.id ?? "",
    name
  );

  if (!order) notFound();

  const rank = RANK[order.status] ?? 0;
  const cancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div>
      <Link
        href="/mes-commandes"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted transition-colors hover:text-brand-black"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Toutes mes commandes
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Commande</p>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-0.03em]">{order.orderNumber}</h1>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            Passée le {formatDate(order.createdAt, true)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-ink-line">
            <h2 className="border-b border-ink-line px-4 py-3 text-[13.5px] font-semibold">
              Articles ({order.items.length})
            </h2>
            <ul className="divide-y divide-ink-line">
              {order.items.map((item, index) => (
                <li key={`${item.productName}-${index}`} className="flex items-center gap-3 px-4 py-3.5">
                  {item.imageUrl && (
                    <div className="relative h-[78px] w-[62px] shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="62px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">{item.productName}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {item.variantInfo} · Qté {item.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-ink-line px-4 py-3.5 text-[12.5px]">
              <div className="flex justify-between text-ink-muted">
                <span>Sous-total</span>
                <span>{formatPrice(order.total - order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Livraison</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-ink-line p-4">
            <h2 className="text-[13.5px] font-semibold">Suivi</h2>
            {cancelled ? (
              <p className="mt-3 text-[12.5px] text-ink-muted">
                Cette commande est {ORDER_STATUS_LABELS[order.status].toLowerCase()}. Contactez-nous
                sur WhatsApp si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
              </p>
            ) : (
              <ol className="mt-4 space-y-0">
                {TIMELINE_STEPS.map((step, index) => {
                  const done = rank >= index + 1;
                  const last = index === TIMELINE_STEPS.length - 1;
                  return (
                    <li key={step.status} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={
                            done
                              ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-black text-white"
                              : "flex h-5 w-5 items-center justify-center rounded-full border border-ink-line bg-white"
                          }
                        >
                          {done && <Check className="h-3 w-3" />}
                        </span>
                        {!last && (
                          <span
                            className={
                              done ? "my-1 h-7 w-px bg-brand-black" : "my-1 h-7 w-px bg-ink-line"
                            }
                          />
                        )}
                      </div>
                      <div className="pb-1">
                        <p
                          className={
                            done
                              ? "text-[12.5px] font-medium text-brand-black"
                              : "text-[12.5px] text-ink-muted"
                          }
                        >
                          {step.label}
                        </p>
                        {done && index + 1 === rank && (
                          <p className="text-[10.5px] text-ink-faint">Statut actuel</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-3">
          <section className="rounded-lg border border-ink-line p-4">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold">
              <MapPin className="h-3.5 w-3.5" /> Livraison
            </h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              {order.customerName}
              <br />
              {order.neighborhood ? `${order.neighborhood}, ` : ""}
              {order.city}
              <br />
              {order.customerPhone}
            </p>
          </section>
          <section className="rounded-lg border border-ink-line p-4">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold">
              <Smartphone className="h-3.5 w-3.5" /> Paiement
            </h2>
            <p className="mt-2.5 text-[12px] text-ink-muted">
              {paymentMethodLabel(order.paymentMethod)}
              <br />
              <span className={order.paymentStatus === "PAID" ? "font-medium text-brand-success" : order.paymentStatus === "FAILED" ? "font-medium text-brand-accent" : "font-medium text-ink-muted"}>
                {PAYMENT_LABELS[order.paymentStatus]}
              </span>
            </p>
          </section>
          <section className="rounded-lg bg-paper-soft p-4">
            <p className="text-[12px] font-semibold">Besoin d&apos;aide ?</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
              Mentionnez le numéro {order.orderNumber} sur WhatsApp.
            </p>
            <a
              href={`https://wa.me/237655000000?text=${encodeURIComponent(
                `Bonjour, je vous contacte au sujet de la commande ${order.orderNumber}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[11.5px] underline underline-offset-4"
            >
              Contacter le service client
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
