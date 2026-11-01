import type { Metadata } from "next";
import { Users, Wallet, UserPlus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ClientsTable } from "@/components/admin/clients-table";
import { StatsCard } from "@/components/admin/stats-card";
import { getAdminCustomers } from "@/lib/admin-data";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Clients",
  robots: { index: false },
};

export default async function AdminClientsPage() {
  const customers = await getAdminCustomers();
  const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const average = customers.length > 0 ? Math.round(totalSpent / customers.length) : 0;
  const recurring = customers.filter((customer) => customer.orderCount > 1).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="CRM"
        title="Clients"
        description="Les acheteurs DESCO MALL, leur valeur et leur dernière commande."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatsCard label="Clients" value={String(customers.length)} hint="ayant déjà commandé" icon={Users} />
        <StatsCard label="Clients récurrents" value={String(recurring)} hint="plus d'une commande" icon={UserPlus} />
        <StatsCard label="Valeur moyenne" value={formatPrice(average)} hint="par client" icon={Wallet} />
      </div>

      <ClientsTable customers={customers} />
    </div>
  );
}
