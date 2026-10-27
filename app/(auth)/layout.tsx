import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { STORY_IMAGE } from "@/lib/demo-data";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 md:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted transition-colors hover:text-brand-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la boutique
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        <p className="text-[10.5px] text-ink-faint">
          © {new Date().getFullYear()} DESCO MALL · Douala, Cameroun
        </p>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src={STORY_IMAGE}
          alt="Client DESCO MALL à Douala"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-x-8 bottom-8 rounded-md bg-white/95 p-6 backdrop-blur-sm">
          <p className="eyebrow">Le distributeur qui distribue les distributeurs</p>
          <p className="mt-2 max-w-sm text-[15px] font-medium leading-snug text-brand-black">
            Des pièces choisies à Douala, livrées partout au Cameroun. Paiement Mobile Money,
            retours sous 7 jours.
          </p>
        </div>
      </div>
    </div>
  );
}
