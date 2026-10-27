import { demoOrders, demoProducts } from "@/lib/demo-data";
import type { DemoOrder, OrderStatus, PaymentStatus } from "@/lib/types";
import { shippingFeeFor } from "@/lib/utils";

const CUSTOMERS = [
  { name: "Aïcha Ngo Bell", email: "client@descomall.cm", phone: "+237 655 234 118", city: "Douala", neighborhood: "Bonapriso" },
  { name: "Jean-Marc Fotso", email: "jm.fotso@example.cm", phone: "+237 699 872 004", city: "Yaoundé", neighborhood: "Bastos" },
  { name: "Clarisse Mbarga", email: "clarisse.mbarga@example.cm", phone: "+237 675 001 922", city: "Douala", neighborhood: "Akwa" },
  { name: "Boris Talla", email: "boris.talla@example.cm", phone: "+237 690 443 108", city: "Bafoussam", neighborhood: "Tamdja" },
  { name: "Nadège Tchoumi", email: "nadege.tchoumi@example.cm", phone: "+237 651 908 774", city: "Douala", neighborhood: "Bonamoussadi" },
  { name: "Mireille Kamga", email: "mireille.kamga@example.cm", phone: "+237 677 118 503", city: "Yaoundé", neighborhood: "Odza" },
  { name: "Yannick Abena", email: "yannick.abena@example.cm", phone: "+237 656 007 341", city: "Douala", neighborhood: "Deido" },
  { name: "Sandrine Etoundi", email: "sandrine.etoundi@example.cm", phone: "+237 691 552 870", city: "Yaoundé", neighborhood: "Mvog-Mbi" },
  { name: "Loïc Mballa", email: "loic.mballa@example.cm", phone: "+237 658 334 902", city: "Douala", neighborhood: "Makepe" },
  { name: "Estelle Nana", email: "estelle.nana@example.cm", phone: "+237 678 220 611", city: "Buea", neighborhood: "Molyko" },
] as const;

const STATUS_CYCLE: OrderStatus[] = [
  "DELIVERED",
  "PAID",
  "SHIPPED",
  "PROCESSING",
  "DELIVERED",
  "PENDING",
  "CANCELLED",
  "DELIVERED",
];

const PAYMENT_BY_STATUS: Record<OrderStatus, PaymentStatus> = {
  PENDING: "PENDING_CONFIRMATION",
  PAID: "PAID",
  PROCESSING: "PAID",
  SHIPPED: "PAID",
  DELIVERED: "PAID",
  CANCELLED: "FAILED",
  REFUNDED: "REFUNDED",
};

function isoDaysAgo(days: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
}

const GENERATED_ORDERS: DemoOrder[] = Array.from({ length: 30 }, (_, index) => {
  const customer = CUSTOMERS[index % CUSTOMERS.length] ?? CUSTOMERS[0]!;
  const product = demoProducts[(index * 5) % demoProducts.length] ?? demoProducts[0]!;
  const status = STATUS_CYCLE[index % STATUS_CYCLE.length] ?? "DELIVERED";
  const quantity = index % 4 === 0 ? 2 : 1;
  const size = product.sizes[index % product.sizes.length] ?? "M";
  const color = product.colors[0]?.name ?? "Noir";
  const shippingFee = shippingFeeFor(customer.city);
  const createdAt = isoDaysAgo(index, 9 + (index % 9));
  const paymentStatus = PAYMENT_BY_STATUS[status];

  return {
    id: `ord_gen_${index + 1}`,
    orderNumber: `DM-2026-${2060 + index}`,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    city: customer.city,
    neighborhood: customer.neighborhood,
    status,
    paymentStatus,
    paymentMethod: index % 2 === 0 ? "MTN_MOMO" : "ORANGE_MONEY",
    total: product.price * quantity + shippingFee,
    shippingFee,
    items: [
      {
        productName: product.name,
        variantInfo: `Taille: ${size}, Couleur: ${color}`,
        imageUrl: product.images[0]?.url,
        quantity,
        unitPrice: product.price,
      },
    ],
    createdAt,
    timeline: [
      { status: "PENDING", note: "Commande créée", at: createdAt },
      ...(paymentStatus === "PAID"
        ? [{ status: "PAID" as OrderStatus, note: "Paiement Mobile Money confirmé", at: createdAt }]
        : []),
    ],
  };
});

export function getAdminOrders(): DemoOrder[] {
  return [...demoOrders, ...GENERATED_ORDERS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAdminOrder(idOrNumber: string): DemoOrder | undefined {
  return getAdminOrders().find(
    (order) => order.id === idOrNumber || order.orderNumber === idOrNumber
  );
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sumRevenue(orders: DemoOrder[]): number {
  return orders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => sum + order.total, 0);
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export type RevenuePoint = { date: string; label: string; revenue: number; orders: number };

export function getRevenueSeries(days = 30): RevenuePoint[] {
  const orders = getAdminOrders();
  const points: RevenuePoint[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - index);
    const key = day.toISOString().slice(0, 10);
    const dayOrders = orders.filter(
      (order) => order.createdAt.slice(0, 10) === key && order.paymentStatus === "PAID"
    );
    points.push({
      date: key,
      label: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(day),
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
      orders: dayOrders.length,
    });
  }

  return points;
}

export function getAdminStats() {
  const orders = getAdminOrders();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const monthOrders = orders.filter((order) => new Date(order.createdAt) >= monthStart);
  const previousMonthOrders = orders.filter((order) => {
    const created = new Date(order.createdAt);
    return created >= previousMonthStart && created < monthStart;
  });

  const revenueThisMonth = sumRevenue(monthOrders);
  const revenuePreviousMonth = sumRevenue(previousMonthOrders);
  const paidOrders = orders.filter((order) => order.paymentStatus === "PAID");

  const statusCounts = orders.reduce<Record<OrderStatus, number>>(
    (accumulator, order) => {
      accumulator[order.status] = (accumulator[order.status] ?? 0) + 1;
      return accumulator;
    },
    {
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    }
  );

  const lowStock = demoProducts.flatMap((product) =>
    Object.entries(product.stock)
      .filter(([, stock]) => stock <= 5)
      .map(([size, stock]) => ({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0]?.url ?? "",
        size,
        stock,
      }))
  );

  const topProducts = Object.values(
    orders.reduce<Record<string, { name: string; quantity: number; revenue: number; image: string }>>(
      (accumulator, order) => {
        for (const item of order.items) {
          const existing = accumulator[item.productName] ?? {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            image: item.imageUrl ?? "",
          };
          existing.quantity += item.quantity;
          existing.revenue += item.unitPrice * item.quantity;
          accumulator[item.productName] = existing;
        }
        return accumulator;
      },
      {}
    )
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    revenueThisMonth,
    revenueGrowth: percentChange(revenueThisMonth, revenuePreviousMonth),
    monthOrders: monthOrders.length,
    orderGrowth: percentChange(monthOrders.length, previousMonthOrders.length),
    averageBasket: paidOrders.length > 0
      ? Math.round(paidOrders.reduce((sum, order) => sum + order.total, 0) / paidOrders.length)
      : 0,
    ordersToProcess: statusCounts.PENDING + statusCounts.PAID + statusCounts.PROCESSING,
    lowStockCount: lowStock.length,
    statusCounts,
    lowStock: lowStock.slice(0, 6),
    topProducts,
    totalOrders: orders.length,
  };
}

export type AdminCustomer = {
  name: string;
  email: string;
  phone: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

export function getAdminCustomers(): AdminCustomer[] {
  const map = new Map<string, AdminCustomer>();
  for (const order of getAdminOrders()) {
    const existing = map.get(order.customerEmail);
    if (existing) {
      existing.orderCount += 1;
      if (order.paymentStatus === "PAID") existing.totalSpent += order.total;
      if (new Date(order.createdAt) > new Date(existing.lastOrderAt)) {
        existing.lastOrderAt = order.createdAt;
      }
    } else {
      map.set(order.customerEmail, {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        city: order.city,
        orderCount: 1,
        totalSpent: order.paymentStatus === "PAID" ? order.total : 0,
        lastOrderAt: order.createdAt,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export type LowStockItem = ReturnType<typeof getAdminStats>["lowStock"][number];
