import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(3, "Le nom doit contenir au moins 3 caractères."),
  slug: z
    .string()
    .trim()
    .min(3, "Le slug est requis.")
    .regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement."),
  description: z.string().trim().min(30, "Ajoutez une description d'au moins 30 caractères."),
  price: z.coerce.number().int().min(100, "Prix minimum : 100 XAF."),
  comparePrice: z.coerce.number().int().optional().or(z.literal(0)),
  categoryId: z.string().min(1, "Choisissez une catégorie."),
  stock: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  metaTitle: z.string().trim().max(70).optional(),
  metaDesc: z.string().trim().max(160).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
