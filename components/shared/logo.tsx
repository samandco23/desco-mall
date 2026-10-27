import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="DESCO MALL — retour à l'accueil"
      className={cn(
        "inline-flex flex-col leading-none",
        invert ? "text-white" : "text-brand-black",
        className
      )}
    >
      <span className="text-[22px] font-bold leading-none tracking-[-0.03em]">
        DESCO
        <span className="text-brand-accent">.</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "mt-[3px] text-[8.5px] font-semibold leading-none tracking-[0.34em]",
          invert ? "text-white/60" : "text-ink-muted"
        )}
      >
        MALL
      </span>
    </Link>
  );
}
