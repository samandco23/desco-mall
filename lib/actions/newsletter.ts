"use server";

import { z } from "zod";

import { upsertBrevoContact } from "@/lib/brevo";

const newsletterSchema = z.object({
  email: z.string().trim().email("Adresse email invalide."),
});

export type NewsletterState = { ok: boolean; message: string };

export async function subscribeNewsletter(formData: FormData): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Email invalide." };
  }

  await upsertBrevoContact({ email: parsed.data.email.toLowerCase() });
  return {
    ok: true,
    message: "Merci ! Vous recevrez nos prochaines nouveautés en avant-première.",
  };
}
