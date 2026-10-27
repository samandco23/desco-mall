import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = ShoppingBag,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-ink-line bg-white px-6 py-16 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-paper-soft">
        <Icon className="h-6 w-6 text-ink-soft" />
      </span>
      <h2 className="text-[18px] font-semibold text-brand-black">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button asChild className="mt-6" size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
