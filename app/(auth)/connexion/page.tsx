import type { Metadata } from "next";
import { Check } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Se connecter",
  robots: { index: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; inscription?: string };
}) {
  const callbackUrl =
    searchParams.callbackUrl && searchParams.callbackUrl.startsWith("/")
      ? searchParams.callbackUrl
      : "/mon-compte";

  return (
    <div>
      {searchParams.inscription === "1" && (
        <p className="mb-5 flex items-start gap-2 rounded-sm border border-brand-success/20 bg-[#EEF7F0] px-3 py-2.5 text-[12px] font-medium text-brand-success">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          Votre compte est créé. Connectez-vous pour accéder à votre espace.
        </p>
      )}
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
