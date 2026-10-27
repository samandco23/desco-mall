import { formatPrice } from "@/lib/utils";

const BREVO_BASE = "https://api.brevo.com/v3";

export const isBrevoConfigured = Boolean(process.env.BREVO_API_KEY);

function brevoHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    accept: "application/json",
    "api-key": process.env.BREVO_API_KEY ?? "",
  };
}

async function brevoFetch(path: string, init: RequestInit): Promise<Response | null> {
  if (!isBrevoConfigured) return null;
  try {
    const response = await fetch(`${BREVO_BASE}${path}`, {
      ...init,
      headers: { ...brevoHeaders(), ...(init.headers ?? {}) },
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error(`[brevo] ${path} a échoué (${response.status}): ${detail}`);
    }
    return response;
  } catch (error) {
    console.error(`[brevo] ${path} indisponible`, error);
    return null;
  }
}

export async function upsertBrevoContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  attributes?: Record<string, string | number | boolean>;
}): Promise<void> {
  const listId = Number(process.env.BREVO_LIST_ID_CLIENTS ?? 0);
  await brevoFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      attributes: {
        PRENOM: params.firstName,
        NOM: params.lastName,
        TELEPHONE: params.phone,
        ...params.attributes,
      },
      listIds: Number.isFinite(listId) && listId > 0 ? [listId] : undefined,
      updateEnabled: true,
    }),
  });
}

export async function sendBrevoEmail(params: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  params?: Record<string, string | number>;
}): Promise<void> {
  await brevoFetch("/smtp/email", {
    method: "POST",
    body: JSON.stringify({
      to: params.to,
      subject: params.subject,
      htmlContent: params.htmlContent,
      sender: {
        name: process.env.BREVO_SENDER_NAME ?? "DESCO MALL",
        email: process.env.BREVO_SENDER_EMAIL ?? "noreply@descomall.cm",
      },
      params: params.params,
    }),
  });
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  await sendBrevoEmail({
    to: [{ email: to, name: firstName }],
    subject: "Bienvenue chez DESCO MALL",
    htmlContent: `
      <div style="font-family:Inter,Arial,sans-serif;color:#111;line-height:1.6">
        <h1 style="font-size:22px">Bienvenue ${firstName} !</h1>
        <p>Votre compte DESCO MALL est créé. Découvrez les nouvelles pièces de la saison.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/catalogue" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Voir le catalogue</a></p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  name: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}): Promise<void> {
  const rows = params.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0">${item.name}</td><td style="padding:6px 0">${item.quantity}</td><td style="padding:6px 0;text-align:right">${formatPrice(item.price)}</td></tr>`
    )
    .join("");

  await sendBrevoEmail({
    to: [{ email: params.to, name: params.name }],
    subject: `Commande ${params.orderNumber} confirmée`,
    htmlContent: `
      <div style="font-family:Inter,Arial,sans-serif;color:#111;line-height:1.6">
        <h1 style="font-size:22px">Commande confirmée</h1>
        <p>Bonjour ${params.name}, votre commande <strong>${params.orderNumber}</strong> est bien reçue.</p>
        <table style="width:100%;border-collapse:collapse">${rows}</table>
        <p style="margin-top:16px"><strong>Total : ${formatPrice(params.total)}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/mes-commandes">Suivre ma commande</a></p>
      </div>
    `,
  });
}

export async function sendOrderStatusEmail(params: {
  to: string;
  name: string;
  orderNumber: string;
  statusLabel: string;
}): Promise<void> {
  await sendBrevoEmail({
    to: [{ email: params.to, name: params.name }],
    subject: `Commande ${params.orderNumber} — ${params.statusLabel}`,
    htmlContent: `
      <div style="font-family:Inter,Arial,sans-serif;color:#111;line-height:1.6">
        <h1 style="font-size:22px">${params.statusLabel}</h1>
        <p>Bonjour ${params.name}, le statut de votre commande <strong>${params.orderNumber}</strong> vient d'être mis à jour.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/mes-commandes">Voir ma commande</a></p>
      </div>
    `,
  });
}
