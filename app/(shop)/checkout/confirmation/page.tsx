import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, MapPin, Phone, Smartphone, Truck } from "lucide-react";

import { ClearCartOnMount } from "@/components/checkout/clear-cart";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false },
};

type ConfirmationOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  neighborhood: string;
  total: number;
  shippingFee: number;
  paymentMethod: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: {
    productName: string;
    variantInfo?: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
  }[];
};

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PAID", label: "Paiement confirmé" },
  { status: "PROCESSING", label: "En préparation" },
  { status: "SHIPPED", label: "Expédiée" },
  { status: "DELIVERED", label: "Livrée" },
];

const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 0,
  REFUNDED: 0,
};

async function loadOrder(orderNumber: string, userId?: string, token?: string): Promise<ConfirmationOrder | null> {
  if (!hasDatabase) return null;

  try {
    if (!userId && !token) return null;
    const order = await db.order.findFirst({
      where: { orderNumber, ...(token ? { confirmationToken: token } : { userId }) },
      include: { items: true, address: true, user: true },
    });
    if (!order) return null;
    return {
      orderNumber: order.orderNumber,
      customerName: order.address?.fullName ?? order.user?.name ?? "Client DESCO",
      customerEmail: order.user?.email ?? order.guestEmail ?? "",
      customerPhone: order.address?.phone ?? order.guestPhone ?? "",
      city: order.shippingCity ?? "",
      neighborhood: order.address?.neighborhood ?? order.shippingNeighborhood ?? "",
      total: order.total,
      shippingFee: order.shippingFee,
      paymentMethod: order.paymentMethod,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        productName: item.productName,
        variantInfo: item.variantInfo ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
  } catch (error) {
    console.error("[confirmation] Lecture commande impossible", error);
    return null;
  }
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; token?: string };
}) {
  const session = await auth();
  const order = searchParams.order ? await loadOrder(searchParams.order, session?.user?.id, searchParams.token) : null;
  const currentRank = order ? STATUS_RANK[order.status] : 1;

  return (
    <div className="container-shop py-10 md:py-14">
      <ClearCartOnMount enabled={order?.status === "PAID"} orderNumber={searchParams.order} confirmationToken={searchParams.token} />

      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF7F0] text-brand-success">
          <Check className="h-8 w-8" />
        </span>
        <p className="eyebrow mt-5">Étape 3 sur 3</p>
        <h1 className="mt-2 text-balance text-[28px] font-bold tracking-[-0.03em] md:text-[34px]">
          {order?.paymentStatus === "PAID" ? "Merci, votre commande est confirmée." : order?.paymentStatus === "FAILED" || order?.status === "CANCELLED" ? "Le paiement n’a pas abouti." : order ? "Votre paiement est en attente." : "Commande introuvable."}
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
          {order ? (
            <>
              {order.status === "PAID" ? "Votre commande" : "Paiement en attente pour la commande"}{" "}
              <span className="font-semibold text-brand-black">{order.orderNumber}</span> a bien
              {order.paymentStatus === "PAID" ? "a été payée. Notre équipe vous contacte pour confirmer la livraison." : order.paymentStatus === "FAILED" || order.status === "CANCELLED" ? "n’a pas été payée. Votre panier est conservé ; vous pouvez revenir au panier pour réessayer." : "est enregistrée, mais le paiement n’est pas encore confirmé. Ne repassez pas commande ; cette page se mettra à jour après confirmation."}
            </>
          ) : (
            <>
              Nous ne trouvons pas de commande confirmée associée à ce lien. Vérifiez votre compte avant de réessayer.
            </>
          )}
        </p>
        {order && (
          <p className="mt-1 text-[12px] text-ink-faint">
            {formatDate(order.createdAt, true)} · Paiement{" "}
            {order.paymentMethod === "MTN_MOMO" ? "MTN Mobile Money" : "Orange Money"}
          </p>
        )}
      </div>

      {order && (
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="rounded-lg border border-ink-line bg-white">
            <div className="grid gap-0 divide-y divide-ink-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { icon: Truck, title: "Livraison", text: `${order.city}${order.neighborhood ? ` · ${order.neighborhood}` : ""}` },
                { icon: Phone, title: "Contact", text: order.customerPhone || order.customerEmail },
                { icon: Smartphone, title: "Paiement", text: order.paymentMethod === "MTN_MOMO" ? "MTN Mobile Money" : "Orange Money" },
              ].map((entry) => (
                <div key={entry.title} className="flex items-start gap-2.5 px-5 py-4">
                  <entry.icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                  <div>
                    <p className="text-[11px] font-semibold text-ink-muted">{entry.title}</p>
                    <p className="mt-0.5 text-[12.5px] text-brand-black">{entry.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <ul className="divide-y divide-ink-line border-t border-ink-line">
              {order.items.map((item, index) => (
                <li key={`${item.productName}-${index}`} className="flex items-center gap-3 px-5 py-4">
                  {item.imageUrl && (
                    <div className="relative h-[72px] w-[56px] shrink-0 overflow-hidden rounded-sm bg-paper-tint">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">{item.productName}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {item.variantInfo} · Quantité {item.quantity}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-ink-line px-5 py-4 text-[12.5px]">
              <div className="flex justify-between text-ink-muted">
                <span>Livraison</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold">
                <span>Total payé</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-ink-line p-5">
            <h2 className="text-[15px] font-semibold">Suivi de la commande</h2>
            <ol className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STEPS.map((step, index) => {
                const done = currentRank >= STATUS_RANK[step.status];
                return (
                  <li key={step.status} className="flex items-start gap-2.5">
                    <span
                      className={
                        done
                          ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-black text-white"
                          : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink-line text-[11px] text-ink-faint"
                      }
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <div>
                      <p
                        className={
                          done
                            ? "text-[12px] font-semibold text-brand-black"
                            : "text-[12px] text-ink-muted"
                        }
                      >
                        {step.label}
                      </p>
                      {done && index === currentRank - 1 && (
                        <p className="mt-0.5 text-[10.5px] text-ink-faint">En cours</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-5 flex items-start gap-2 text-[11.5px] leading-relaxed text-ink-muted">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Livraison estimée sous 48 h ouvrées à {order.city}. Vous recevrez un message
              WhatsApp avant le passage du livreur.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/catalogue">Continuer mes achats</Link>
            </Button>
            {session?.user && (
              <Button asChild variant="outline">
                <Link href="/mes-commandes">Voir mes commandes</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {!order && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/catalogue">Retour à la boutique</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/aide#contact">Contacter le service client</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
