import type { OrderRecord, OrderStatus } from "@/lib/types";
import { db, hasDatabase } from "@/lib/db";

function toOrderRecord(row: {
  id: string; orderNumber: string; createdAt: Date; status: OrderStatus; paymentStatus: OrderRecord["paymentStatus"];
  paymentMethod: string; total: number; shippingFee: number; guestEmail: string | null; guestPhone: string | null;
  shippingCity: string | null; user: { name: string | null; email: string; phone: string | null } | null;
  address: { fullName: string; phone: string; city: string; neighborhood: string } | null;
  items: { productName: string; variantInfo: string | null; imageUrl: string | null; quantity: number; unitPrice: number }[];
  statusHistory: { status: OrderStatus; note: string | null; createdAt: Date }[];
}): OrderRecord {
  return {
    id: row.id, orderNumber: row.orderNumber,
    customerName: row.address?.fullName ?? row.user?.name ?? "Client",
    customerEmail: row.user?.email ?? row.guestEmail ?? "",
    customerPhone: row.address?.phone ?? row.user?.phone ?? row.guestPhone ?? "",
    city: row.address?.city ?? row.shippingCity ?? "", neighborhood: row.address?.neighborhood ?? "",
    status: row.status, paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod === "ORANGE_MONEY" ? "ORANGE_MONEY" : "MTN_MOMO",
    total: row.total, shippingFee: row.shippingFee, createdAt: row.createdAt.toISOString(),
    items: row.items.map((item) => ({ productName: item.productName, variantInfo: item.variantInfo ?? undefined, imageUrl: item.imageUrl ?? undefined, quantity: item.quantity, unitPrice: item.unitPrice })),
    timeline: row.statusHistory.map((entry) => ({ status: entry.status, note: entry.note ?? undefined, at: entry.createdAt.toISOString() })),
  };
}

const orderInclude = { items: true, statusHistory: { orderBy: { createdAt: "asc" as const } }, user: true, address: true };

export async function getAdminOrders(): Promise<OrderRecord[]> {
  if (!hasDatabase) return [];
  const rows = await db.order.findMany({ include: orderInclude, orderBy: { createdAt: "desc" } });
  return rows.map(toOrderRecord);
}

export async function getAdminOrder(idOrNumber: string): Promise<OrderRecord | undefined> {
  if (!hasDatabase) return undefined;
  const row = await db.order.findFirst({ where: { OR: [{ id: idOrNumber }, { orderNumber: idOrNumber }] }, include: orderInclude });
  return row ? toOrderRecord(row) : undefined;
}

function startOfMonth(date: Date): Date { return new Date(date.getFullYear(), date.getMonth(), 1); }
function sumRevenue(orders: OrderRecord[]): number { return orders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + order.total, 0); }
function percentChange(current: number, previous: number): number | null { if (previous === 0) return current > 0 ? 100 : null; return Math.round(((current - previous) / previous) * 100); }

export type RevenuePoint = { date: string; label: string; revenue: number; orders: number };
export async function getRevenueSeries(days = 30): Promise<RevenuePoint[]> {
  const orders = await getAdminOrders();
  const points: RevenuePoint[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(); day.setDate(day.getDate() - index);
    const key = day.toISOString().slice(0, 10);
    const rows = orders.filter((order) => order.createdAt.slice(0, 10) === key && order.paymentStatus === "PAID");
    points.push({ date: key, label: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(day), revenue: rows.reduce((sum, order) => sum + order.total, 0), orders: rows.length });
  }
  return points;
}

export async function getAdminStats() {
  const [orders, variants] = await Promise.all([
    getAdminOrders(),
    hasDatabase ? db.productVariant.findMany({ where: { stock: { lte: 5 } }, include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } }, orderBy: { stock: "asc" }, take: 100 }) : Promise.resolve([]),
  ]);
  const now = new Date(); const monthStart = startOfMonth(now); const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthOrders = orders.filter((order) => new Date(order.createdAt) >= monthStart);
  const previousOrders = orders.filter((order) => { const date = new Date(order.createdAt); return date >= prevStart && date < monthStart; });
  const paid = orders.filter((order) => order.paymentStatus === "PAID");
  const statusCounts = orders.reduce<Record<OrderStatus, number>>((acc, order) => { acc[order.status] += 1; return acc; }, { PENDING: 0, PAID: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0, REFUNDED: 0 });
  const lowStock = variants.map((entry) => ({ productId: entry.productId, name: entry.product.name, slug: entry.product.slug, image: entry.product.images[0]?.url ?? "", size: entry.size ?? "TU", stock: entry.stock }));
  const topProducts = Object.values(orders.filter((order) => order.paymentStatus === "PAID").flatMap((order) => order.items).reduce<Record<string, { name: string; quantity: number; revenue: number; image: string }>>((acc, item) => { const value = acc[item.productName] ?? { name: item.productName, quantity: 0, revenue: 0, image: item.imageUrl ?? "" }; value.quantity += item.quantity; value.revenue += item.unitPrice * item.quantity; acc[item.productName] = value; return acc; }, {})).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  return { revenueThisMonth: sumRevenue(monthOrders), revenueGrowth: percentChange(sumRevenue(monthOrders), sumRevenue(previousOrders)), monthOrders: monthOrders.length, orderGrowth: percentChange(monthOrders.length, previousOrders.length), averageBasket: paid.length ? Math.round(paid.reduce((sum, order) => sum + order.total, 0) / paid.length) : 0, ordersToProcess: statusCounts.PENDING + statusCounts.PAID + statusCounts.PROCESSING, lowStockCount: lowStock.length, statusCounts, lowStock: lowStock.slice(0, 6), topProducts, totalOrders: orders.length };
}

export type AdminCustomer = { name: string; email: string; phone: string; city: string; orderCount: number; totalSpent: number; lastOrderAt: string };
export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  if (!hasDatabase) return [];
  const users = await db.user.findMany({ where: { role: "USER" }, include: { addresses: { where: { isDefault: true }, take: 1 }, orders: { include: { items: true }, orderBy: { createdAt: "desc" } } } });
  return users.map((user) => {
    const paidOrders = user.orders.filter((order) => order.paymentStatus === "PAID");
    return { name: user.name ?? "Client", email: user.email, phone: user.phone ?? user.addresses[0]?.phone ?? "", city: user.addresses[0]?.city ?? "", orderCount: user.orders.length, totalSpent: paidOrders.reduce((sum, order) => sum + order.total, 0), lastOrderAt: user.orders[0]?.createdAt.toISOString() ?? user.createdAt.toISOString() };
  }).sort((a, b) => b.totalSpent - a.totalSpent);
}

export type LowStockItem = Awaited<ReturnType<typeof getAdminStats>>["lowStock"][number];
