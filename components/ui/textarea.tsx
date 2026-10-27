import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-[110px] w-full rounded-sm border border-ink-line bg-white px-3.5 py-3 text-[14px] text-brand-black placeholder:text-ink-faint transition-colors focus:border-brand-black focus:outline-none focus:ring-0",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
