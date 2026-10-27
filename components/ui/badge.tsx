import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "new"
  | "promo"
  | "arrival"
  | "outline"
  | "success"
  | "muted"
  | "warning"
  | "danger";

const styles: Record<BadgeVariant, string> = {
  new: "bg-brand-black text-white",
  promo: "bg-brand-accent text-white",
  arrival:
    "border border-brand-accent/15 bg-brand-accent-bg text-brand-accent",
  outline: "border border-ink-line bg-white text-ink-soft",
  success: "bg-[#EEF7F0] text-brand-success",
  muted: "bg-paper-tint text-ink-soft",
  warning: "bg-[#FFF7E8] text-[#9A6508]",
  danger: "bg-brand-accent-bg text-brand-accent",
};

export function Badge({
  className,
  variant = "outline",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[11px] font-semibold leading-none",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
