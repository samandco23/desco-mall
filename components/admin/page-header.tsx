import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 text-[24px] font-bold tracking-[-0.03em]">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
