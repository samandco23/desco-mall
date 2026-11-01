"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { OrderStatusBadge, ORDER_STATUS_LABELS } from "@/components/shared/order-status-badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderRecord, OrderStatus } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

export function OrdersTable({ orders }: { orders: OrderRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!needle) return true;
      return `${order.orderNumber} ${order.customerName} ${order.customerEmail} ${order.city}`
        .toLowerCase()
        .includes(needle);
    });
  }, [orders, query, status]);

  return (
    <div className="rounded-md border border-ink-line bg-white">
      <div className="flex flex-col gap-2 border-b border-ink-line p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="N° de commande, client, email, ville…"
            aria-label="Rechercher une commande"
            className="h-9 pl-9 text-[12.5px]"
          />
        </div>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filtrer par statut"
          className="h-9 sm:w-[180px]"
        >
          <option value="all">Tous les statuts</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((entry) => (
            <option key={entry} value={entry}>
              {ORDER_STATUS_LABELS[entry]}
            </option>
          ))}
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commande</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="whitespace-nowrap font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                <p className="text-[12.5px]">{order.customerName}</p>
                <p className="text-[10.5px] text-ink-faint">{order.customerEmail}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-ink-muted">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell className="text-ink-muted">{order.city}</TableCell>
              <TableCell className="text-ink-muted">
                {order.paymentMethod === "MTN_MOMO" ? "MTN MoMo" : "Orange Money"}
              </TableCell>
              <TableCell className="whitespace-nowrap font-semibold">
                {formatPrice(order.total)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/commandes/${order.id}`}
                  className="text-[11.5px] font-medium underline-offset-4 hover:underline"
                >
                  Voir
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-[12px] text-ink-muted">
                Aucune commande ne correspond à ces filtres.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="border-t border-ink-line px-4 py-2.5 text-[10.5px] text-ink-faint">
        {filtered.length} commande{filtered.length > 1 ? "s" : ""} affichée
        {filtered.length > 1 ? "s" : ""} sur {orders.length}
      </p>
    </div>
  );
}
