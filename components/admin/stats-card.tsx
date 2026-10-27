import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatsCard({
  label,
  value,
  hint,
  growth,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  growth?: number | null;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-ink-line bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-medium text-ink-muted">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-sm",
            accent ? "bg-brand-accent-bg text-brand-accent" : "bg-paper-soft text-ink-soft"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-[24px] font-bold leading-tight tracking-[-0.02em]">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10.5px]">
        {growth !== undefined && growth !== null && (
          <span
            className={cn(
              "flex items-center gap-0.5 font-semibold",
              growth >= 0 ? "text-brand-success" : "text-brand-accent"
            )}
          >
            {growth >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {growth >= 0 ? "+" : ""}
            {growth} %
          </span>
        )}
        {hint && <span className="text-ink-faint">{hint}</span>}
      </div>
    </div>
  );
}
