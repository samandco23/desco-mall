import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { hasDatabase } from "@/lib/db";
import { isBrevoConfigured } from "@/lib/brevo";
import { isFapshiConfigured } from "@/lib/fapshi";
import { isRedisConfigured } from "@/lib/redis";

export const metadata: Metadata = {
  title: "Paramètres",
  robots: { index: false },
};

export default function AdminSettingsPage() {
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
        }}
        integrations={{
          database: hasDatabase,
          fapshi: isFapshiConfigured,
          brevo: isBrevoConfigured,
          redis: isRedisConfigured,
          uploadthing: Boolean(process.env.UPLOADTHING_SECRET),
        }}
      />
    </div>
  );
}
