import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  description,
  actionLabel,
  actionHref,
  className,
  eyebrow,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-6", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-[22px] font-bold tracking-[-0.03em] text-brand-black">{title}</h2>
        {description && (
          <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-brand-black underline-offset-4 hover:underline"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
