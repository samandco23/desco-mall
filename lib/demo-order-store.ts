import type { DemoOrder } from "@/lib/types";

const globalForOrders = globalThis as unknown as {
  descoDemoOrders?: Map<string, DemoOrder>;
};

const store = globalForOrders.descoDemoOrders ?? new Map<string, DemoOrder>();
globalForOrders.descoDemoOrders = store;

export function saveDemoOrder(order: DemoOrder): void {
  store.set(order.orderNumber, order);
}

export function findDemoOrder(orderNumber: string): DemoOrder | undefined {
  return store.get(orderNumber);
}
