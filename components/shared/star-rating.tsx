import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  reviewCount,
  className,
  compact = false,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Note de ${rating.toFixed(1)} sur 5`}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              compact ? "h-3.5 w-3.5" : "h-[15px] w-[15px]",
              index < Math.round(rating)
                ? "fill-brand-warning text-brand-warning"
                : "fill-ink-line text-ink-line"
            )}
          />
        ))}
      </div>
      {!compact && (
        <span className="text-[13px] text-ink-muted">
          <span className="font-semibold text-brand-black">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && ` · ${reviewCount} avis`}
        </span>
      )}
    </div>
  );
}
