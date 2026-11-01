import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { isBrevoConfigured } from "@/lib/brevo";
import { isFapshiConfigured } from "@/lib/fapshi";
import { isRedisConfigured } from "@/lib/redis";
import { db, hasDatabase } from "@/lib/db";
import { isKpayConfigured } from "@/lib/kpay";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  const providerSetting = hasDatabase ? await db.setting.findUnique({ where: { key: "payment.provider" } }) : null;
  return (
    <div>
      <AdminPageHeader
        eyebrow="Réglages"
        title="Paramètres"
        description="Identité de la boutique, livraison, intégrations et webhooks."
      />
      <SettingsForm
        initial={{
          shopName: "DESCO MALL",
          shopEmail: "bonjour@descomall.cm",
          shopPhone: "+237 655 000 000",
          shopAddress: "Akwa, Douala — Cameroun",
          paymentProvider: providerSetting?.value === "KPAY" ? "KPAY" : "FAPSHI",
        }}
        integrations={{
          database: hasDatabase,
          fapshi: isFapshiConfigured,
          kpay: isKpayConfigured,
          brevo: isBrevoConfigured,
          redis: isRedisConfigured,
          uploadthing: Boolean(process.env.UPLOADTHING_SECRET),
          stock: Boolean(process.env.STOCK_API_KEY),
        }}
      />
    </div>
  );
}
