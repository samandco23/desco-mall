import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { ProfileForm } from "@/components/account/profile-form";
import { auth } from "@/lib/auth";
import { DEMO_CLIENT } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Mes informations",
  robots: { index: false },
};

export default async function InformationsPage() {
  const session = await auth();
  const name = session?.user?.name ?? DEMO_CLIENT.name;
  const email = session?.user?.email ?? DEMO_CLIENT.email;

  return (
    <div>
      <p className="eyebrow">Profil</p>
      <h1 className="mt-2 text-[26px] font-bold tracking-[-0.03em]">Mes informations</h1>
      <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-muted">
        Ces informations servent à préparer vos livraisons. Le numéro de téléphone doit être
        joignable sur WhatsApp.
      </p>

      <div className="mt-7">
        <ProfileForm
          name={name}
          email={email}
          phone={DEMO_CLIENT.phone}
          city={DEMO_CLIENT.city}
          neighborhood={DEMO_CLIENT.neighborhood}
        />
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-md border border-ink-line p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
        <p className="text-[11.5px] leading-relaxed text-ink-muted">
          Vos données ne sont jamais revendues. Vous pouvez demander la suppression de votre
          compte à tout moment en écrivant à bonjour@descomall.cm.
        </p>
      </div>
    </div>
  );
}
