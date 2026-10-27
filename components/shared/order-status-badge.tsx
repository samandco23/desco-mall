import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  "success" | "warning" | "muted" | "danger" | "outline"
> = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "outline",
  SHIPPED: "outline",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "muted",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Non payée",
  PENDING_CONFIRMATION: "À confirmer",
  PAID: "Payée",
  FAILED: "Échouée",
  REFUNDED: "Remboursée",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_STATUS_VARIANTS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

export function paymentMethodLabel(method: string): string {
  if (method === "MTN_MOMO") return "MTN Mobile Money";
  if (method === "ORANGE_MONEY") return "Orange Money";
  return method;
}
