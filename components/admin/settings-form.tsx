"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSettings } from "@/lib/actions/admin";
import { Select } from "@/components/ui/select";
import { SHIPPING_FEES, formatPrice } from "@/lib/utils";

type Integrations = {
  database: boolean;
  fapshi: boolean;
  kpay: boolean;
  brevo: boolean;
  redis: boolean;
  uploadthing: boolean;
  stock: boolean;
};

export function SettingsForm({
  initial,
  integrations,
}: {
  initial: { shopName: string; shopEmail: string; shopPhone: string; shopAddress: string; paymentProvider: "FAPSHI" | "KPAY" };
  integrations: Integrations;
}) {
  const [values, setValues] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function persistSettings() {
    setPending(true);
    setMessage(null);
    const result = await saveSettings(values);
    setPending(false);
    setMessage({ ok: result.ok, text: result.message });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await persistSettings();
  }

  const integrationRows: { label: string; description: string; enabled: boolean }[] = [
    { label: "Neon PostgreSQL", description: "Base de données et Prisma", enabled: integrations.database },
    { label: "Fapshi", description: "MTN MoMo & Orange Money", enabled: integrations.fapshi },
    { label: "KPay", description: "Paiement Mobile Money via page sécurisée KPay", enabled: integrations.kpay },
    { label: "Brevo", description: "Emails transactionnels et CRM", enabled: integrations.brevo },
    { label: "Upstash Redis", description: "Panier invité et rate limiting", enabled: integrations.redis },
    { label: "Uploadthing", description: "Upload des images produit", enabled: integrations.uploadthing },
    { label: "Outil de gestion de stock", description: "Synchronisation signée par SKU", enabled: integrations.stock },
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-md border border-ink-line bg-white p-4">
        <h2 className="text-[14px] font-semibold">Identité de la boutique</h2>
        <p className="mt-0.5 text-[11px] text-ink-muted">
          Ces informations apparaissent sur les emails et les documents de livraison.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="shopName">Nom commercial</Label>
            <Input
              id="shopName"
              value={values.shopName}
              onChange={(event) => setValues({ ...values, shopName: event.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="shopEmail">Email public</Label>
            <Input
              id="shopEmail"
              type="email"
              value={values.shopEmail}
              onChange={(event) => setValues({ ...values, shopEmail: event.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="shopPhone">Téléphone / WhatsApp</Label>
            <Input
              id="shopPhone"
              value={values.shopPhone}
              onChange={(event) => setValues({ ...values, shopPhone: event.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="shopAddress">Adresse</Label>
            <Input
              id="shopAddress"
              value={values.shopAddress}
              onChange={(event) => setValues({ ...values, shopAddress: event.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>
        {message && (
          <p
            className={
              message.ok
                ? "mt-3 flex items-start gap-1.5 text-[11px] font-medium text-brand-success"
                : "mt-3 text-[11px] font-medium text-brand-accent"
            }
            role="status"
          >
            {message.ok && <Check className="mt-0.5 h-3 w-3" />}
            {message.text}
          </p>
        )}
        <Button type="submit" size="sm" disabled={pending} className="mt-4">
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Enregistrer
            </>
          )}
        </Button>
      </form>

      <section className="rounded-md border border-ink-line bg-white p-4">
        <h2 className="text-[14px] font-semibold">Intégrations</h2>
        <p className="mt-0.5 text-[11px] text-ink-muted">
          Statut lu depuis les variables d&apos;environnement du serveur.
        </p>
        <ul className="mt-3 divide-y divide-ink-line">
          {integrationRows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-4 py-2.5">
              <div>
                <p className="text-[12px] font-medium">{row.label}</p>
                <p className="text-[10.5px] text-ink-faint">{row.description}</p>
              </div>
              <Badge variant={row.enabled ? "success" : "muted"}>
                {row.enabled ? "Configuré" : "À connecter"}
              </Badge>
            </li>
          ))}
        </ul>
        <div className="mt-4 max-w-sm">
          <Label htmlFor="paymentProvider">Fournisseur actif au paiement</Label>
          <Select id="paymentProvider" value={values.paymentProvider} onChange={(event) => setValues({ ...values, paymentProvider: event.target.value as "FAPSHI" | "KPAY" })} className="mt-1.5">
            <option value="FAPSHI" disabled={!integrations.fapshi}>Fapshi{integrations.fapshi ? "" : " — à configurer"}</option>
            <option value="KPAY" disabled={!integrations.kpay}>KPay{integrations.kpay ? "" : " — à configurer"}</option>
          </Select>
          <p className="mt-1 text-[10.5px] text-ink-faint">Le fournisseur ne peut être sélectionné que si ses clés serveur sont configurées.</p>
          <Button type="button" size="sm" disabled={pending} onClick={persistSettings} className="mt-3">{pending ? "Enregistrement…" : "Enregistrer le fournisseur"}</Button>
          {message && <p className={`mt-2 text-[11px] ${message.ok ? "text-brand-success" : "text-brand-accent"}`} role="status">{message.text}</p>}
        </div>
      </section>

      <section className="rounded-md border border-ink-line bg-white p-4">
        <h2 className="text-[14px] font-semibold">Frais de livraison</h2>
        <p className="mt-0.5 text-[11px] text-ink-muted">
          Barème appliqué au checkout selon la destination.
        </p>
        <div className="mt-3 grid gap-x-8 sm:grid-cols-2">
          {Object.entries(SHIPPING_FEES).map(([city, fee]) => (
            <div
              key={city}
              className="flex items-center justify-between border-b border-ink-line py-2 text-[11.5px]"
            >
              <span className="text-ink-muted">{city}</span>
              <span className="font-semibold">{formatPrice(fee)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-ink-line bg-white p-4">
        <h2 className="text-[14px] font-semibold">Webhooks</h2>
        <div className="mt-3 space-y-2 text-[11.5px]">
          <div className="rounded-sm bg-paper-soft px-3 py-2">
            <p className="font-medium">Fapshi — paiement (si activé)</p>
            <code className="text-[10.5px] text-ink-muted">POST /api/webhooks/fapshi</code>
            <p className="mt-1 text-[10px] text-ink-faint">
              Signature HMAC-SHA256 vérifiée avec FAPSHI_WEBHOOK_SECRET.
            </p>
          </div>
          <div className="rounded-sm bg-paper-soft px-3 py-2">
            <p className="font-medium">KPay — paiement</p>
            <code className="text-[10.5px] text-ink-muted">POST /api/webhooks/kpay</code>
            <p className="mt-1 text-[10px] text-ink-faint">Configurez l’URL dans le tableau de bord KPay et définissez KPAY_API_KEY, KPAY_SECRET_KEY et KPAY_WEBHOOK_SECRET dans Vercel.</p>
          </div>
          <div className="rounded-sm bg-paper-soft px-3 py-2">
            <p className="font-medium">Stock externe</p>
            <code className="text-[10.5px] text-ink-muted">POST /api/webhooks/stock</code>
            <p className="mt-1 text-[10px] text-ink-faint">
              Configurez STOCK_API_KEY côté serveur. Envoyez le JSON <code>{'{"items":[{"sku":"SKU-123","stock":12}]}'}</code> avec x-desco-signature = sha256=HMAC-SHA256 du corps brut. Les SKU doivent correspondre aux variantes du catalogue.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
