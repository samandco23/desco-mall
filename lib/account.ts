import { db, hasDatabase } from "@/lib/db";
import type { OrderRecord } from "@/lib/types";

export async function getCustomerOrders(
  email: string,
  userId: string,
  name: string
): Promise<OrderRecord[]> {
  if (!hasDatabase) {
    return [];
  }

  try {
    const rows = await db.order.findMany({
      where: { OR: [{ userId }, { guestEmail: email }] },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      id: row.id,
      orderNumber: row.orderNumber,
      customerName: name,
      customerEmail: row.guestEmail ?? email,
      customerPhone: row.guestPhone ?? "",
      city: row.shippingCity ?? "",
      neighborhood: "",
      status: row.status,
      paymentStatus: row.paymentStatus,
      paymentMethod:
        row.paymentMethod === "ORANGE_MONEY" ? "ORANGE_MONEY" : "MTN_MOMO",
      total: row.total,
      shippingFee: row.shippingFee,
      createdAt: row.createdAt.toISOString(),
      items: row.items.map((item) => ({
        productName: item.productName,
        variantInfo: item.variantInfo ?? undefined,
        imageUrl: item.imageUrl ?? undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      timeline: row.statusHistory.map((entry) => ({
        status: entry.status,
        note: entry.note ?? undefined,
        at: entry.createdAt.toISOString(),
      })),
    }));
  } catch (error) {
    console.error("[account] Lecture des commandes impossible", error);
    return [];
  }
}

export async function getCustomerOrder(
  idOrNumber: string,
  email: string,
  userId: string,
  name: string
): Promise<OrderRecord | null> {
  const orders = await getCustomerOrders(email, userId, name);
  return (
    orders.find(
      (order) => order.id === idOrNumber || order.orderNumber === idOrNumber
    ) ?? null
  );
}

export function customerStats(orders: OrderRecord[]) {
  const paid = orders.filter((order) => order.paymentStatus === "PAID");
  const active = orders.filter((order) =>
    ["PENDING", "PAID", "PROCESSING", "SHIPPED"].includes(order.status)
  );
  return {
    orderCount: orders.length,
    activeCount: active.length,
    totalSpent: paid.reduce((sum, order) => sum + order.total, 0),
    lastOrder: orders[0] ?? null,
  };
}
