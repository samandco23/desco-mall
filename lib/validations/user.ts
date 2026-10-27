import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Indiquez votre nom complet.").max(80),
    email: z.string().trim().email("Adresse email invalide."),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => /^(\+237|237)?\s?[26]\d{8}$/.test(value.replace(/\s/g, "")),
        "Numéro camerounais invalide."
      ),
    password: z
      .string()
      .min(8, "8 caractères minimum.")
      .regex(/[A-Za-z]/, "Ajoutez au moins une lettre.")
      .regex(/\d/, "Ajoutez au moins un chiffre."),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom complet.").max(80),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => /^(\+237|237)?\s?[26]\d{8}$/.test(value.replace(/\s/g, "")),
      "Numéro camerounais invalide."
    ),
  city: z.string().min(2, "Choisissez votre ville."),
  neighborhood: z.string().trim().min(2, "Indiquez votre quartier."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
