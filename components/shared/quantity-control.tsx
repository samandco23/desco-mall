"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function QuantityControl({
  value,
  onChange,
  max = 99,
  className,
  compact = false,
  label = "Quantité",
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
  compact?: boolean;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-sm border-[1.5px] border-ink-line bg-white",
        className
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Diminuer la quantité"
        className={cn(
          "flex items-center justify-center bg-paper-soft text-brand-black transition-colors hover:bg-paper-tint disabled:cursor-not-allowed disabled:opacity-40",
          compact ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <Minus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
      <span
        className={cn(
          "flex items-center justify-center border-x border-ink-line text-[14px] font-semibold tabular-nums",
          compact ? "w-9" : "w-11"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className={cn(
          "flex items-center justify-center bg-paper-soft text-brand-black transition-colors hover:bg-paper-tint disabled:cursor-not-allowed disabled:opacity-40",
          compact ? "h-8 w-8" : "h-9 w-9"
        )}
      >
        <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    </div>
  );
}
