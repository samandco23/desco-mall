import { z } from "zod";

export const cartLineSchema = z.object({
  key: z.string().min(1),
  productId: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  price: z.number().int().nonnegative(),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  maxQuantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Indiquez votre nom complet.")
    .max(80, "Le nom est trop long."),
  email: z.string().trim().email("Adresse email invalide."),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, " "))
    .refine(
      (value) => /^(\+237|237)?\s?[26]\d{8}$/.test(value.replace(/\s/g, "")),
      "Numéro camerounais invalide. Exemple : +237 6XX XXX XXX."
    ),
  city: z.string().trim().min(2, "Choisissez votre ville de livraison."),
  neighborhood: z
    .string()
    .trim()
    .min(2, "Indiquez votre quartier pour la livraison.")
    .max(80),
  instructions: z.string().trim().max(400, "400 caractères maximum.").optional(),
  paymentMethod: z.enum(["MTN_MOMO", "ORANGE_MONEY"]),
  items: z.array(cartLineSchema).min(1, "Votre panier est vide."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartLineInput = z.infer<typeof cartLineSchema>;

export type CheckoutResult =
  | { ok: true; orderNumber: string; redirectUrl?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
