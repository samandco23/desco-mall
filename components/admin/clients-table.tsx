"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCustomer } from "@/lib/admin-data";
import { formatDate, formatPrice, initials } from "@/lib/utils";

export function ClientsTable({ customers }: { customers: AdminCustomer[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.city}`.toLowerCase().includes(needle)
    );
  }, [customers, query]);

  return (
    <div className="rounded-md border border-ink-line bg-white">
      <div className="border-b border-ink-line p-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un client, un email, une ville…"
            aria-label="Rechercher un client"
            className="h-9 pl-9 text-[12.5px]"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Commandes</TableHead>
            <TableHead>Total dépensé</TableHead>
            <TableHead>Dernière commande</TableHead>
            <TableHead className="text-right">Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((customer) => (
            <TableRow key={customer.email}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-soft text-[10px] font-bold text-ink-soft">
                    {initials(customer.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">{customer.name}</p>
                    <p className="truncate text-[10.5px] text-ink-faint">{customer.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-ink-muted">{customer.city}</TableCell>
              <TableCell className="whitespace-nowrap text-ink-muted">{customer.phone}</TableCell>
              <TableCell className="text-ink-muted">{customer.orderCount}</TableCell>
              <TableCell className="whitespace-nowrap font-semibold">
                {formatPrice(customer.totalSpent)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-ink-muted">
                {formatDate(customer.lastOrderAt)}
              </TableCell>
              <TableCell className="text-right">
                <a
                  href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-medium underline-offset-4 hover:underline"
                >
                  WhatsApp
                </a>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-[12px] text-ink-muted">
                Aucun client ne correspond à cette recherche.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className="border-t border-ink-line px-4 py-2.5 text-[10.5px] text-ink-faint">
        {filtered.length} client{filtered.length > 1 ? "s" : ""} affiché
        {filtered.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
