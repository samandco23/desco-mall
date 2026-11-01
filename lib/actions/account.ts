"use server";

import { auth } from "@/lib/auth";
import { db, hasDatabase } from "@/lib/db";
import { profileSchema } from "@/lib/validations/user";

export type ProfileState = { ok: boolean; message: string };

export async function updateProfile(formData: FormData): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Votre session a expiré. Reconnectez-vous." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    neighborhood: formData.get("neighborhood"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.",
    };
  }

  if (!hasDatabase) {
    return {
      ok: false,
      message: "Le service de compte est momentanément indisponible.",
    };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    });

    const existing = await db.address.findFirst({
      where: { userId: session.user.id, label: "Domicile" },
    });

    if (existing) {
      await db.address.update({
        where: { id: existing.id },
        data: {
          fullName: parsed.data.name,
          phone: parsed.data.phone,
          city: parsed.data.city,
          neighborhood: parsed.data.neighborhood,
        },
      });
    } else {
      await db.address.create({
        data: {
          userId: session.user.id,
          label: "Domicile",
          fullName: parsed.data.name,
          phone: parsed.data.phone,
          city: parsed.data.city,
          neighborhood: parsed.data.neighborhood,
          isDefault: true,
        },
      });
    }

    return { ok: true, message: "Vos informations ont été mises à jour." };
  } catch (error) {
    console.error("[account] Mise à jour du profil impossible", error);
    return { ok: false, message: "Impossible d'enregistrer vos informations pour le moment." };
  }
}
