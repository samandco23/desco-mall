import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-8 text-[72px] font-bold leading-none tracking-[-0.05em]">404</p>
      <h1 className="mt-3 text-[22px] font-bold tracking-[-0.02em]">Cette page a disparu.</h1>
      <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-muted">
        Le lien est peut-être obsolète, ou la pièce que vous cherchez n&apos;est plus au catalogue.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalogue">Voir le catalogue</Link>
        </Button>
      </div>
    </div>
  );
}
