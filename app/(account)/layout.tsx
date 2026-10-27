import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AccountNav } from "@/components/account/account-nav";
import { Logo } from "@/components/shared/logo";
import { auth } from "@/lib/auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion?callbackUrl=/mon-compte");
  }

  const name = session.user.name ?? "Client DESCO";
  const email = session.user.email ?? "";
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-line bg-white">
        <div className="container-shop flex h-16 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/catalogue"
              className="hidden items-center gap-1.5 text-[12px] text-ink-muted transition-colors hover:text-brand-black sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Retour à la boutique
            </Link>
            <span className="rounded-full bg-paper-soft px-3 py-1.5 text-[11px] font-medium text-ink-muted">
              Espace client
            </span>
          </div>
        </div>
      </header>

      <div className="container-shop grid gap-8 py-8 md:grid-cols-[220px_1fr] md:gap-12 md:py-10">
        <AccountNav name={name} email={email} isAdmin={isAdmin} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
