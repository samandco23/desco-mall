import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-sm border border-ink-line bg-white px-3.5 text-[14px] text-brand-black placeholder:text-ink-faint transition-colors focus:border-brand-black focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-paper-soft",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
