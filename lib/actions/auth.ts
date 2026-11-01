"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { signIn, signOut } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { upsertBrevoContact } from "@/lib/brevo";
import { registerSchema } from "@/lib/validations/user";
import { getPublicBaseUrl } from "@/lib/site-url";

function safeCallback(value: FormDataEntryValue | null): string {
  const raw = typeof value === "string" ? value : "/mon-compte";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/mon-compte";
}

export async function loginAction(formData: FormData): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      redirectTo: new URL(safeCallback(formData.get("callbackUrl")), getPublicBaseUrl(await headers())).toString(),
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? "Email ou mot de passe incorrect."
        : "Connexion impossible pour le moment. Réessayez.";
    }
    throw error;
  }
}

export async function registerAction(formData: FormData): Promise<string | undefined> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Vérifiez les informations du formulaire.";
  }

  if (!hasDatabase) {
    return "Le service de compte est momentanément indisponible. Réessayez plus tard.";
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return "Un compte existe déjà avec cette adresse email.";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      passwordHash,
      role: "USER",
    },
  });

  await upsertBrevoContact({
    email,
    firstName: parsed.data.name.split(" ")[0],
    lastName: parsed.data.name.split(" ").slice(1).join(" "),
    phone: parsed.data.phone,
  });

  redirect("/connexion?inscription=1");
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
