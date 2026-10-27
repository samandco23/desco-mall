import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-black text-white hover:bg-[#2a2a2a]",
        outline:
          "border-[1.5px] border-ink-line bg-white text-brand-black hover:border-ink-faint",
        ghost: "text-brand-black hover:bg-paper-tint",
        accent: "bg-brand-accent text-white hover:bg-[#c91f24]",
        success: "bg-brand-success text-white",
        link: "h-auto p-0 text-brand-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[52px] rounded-md px-6 text-[15px] tracking-[-0.01em]",
        sm: "h-10 rounded-sm px-4 text-[13px]",
        lg: "h-14 rounded-md px-8 text-[15px]",
        icon: "h-10 w-10 rounded-sm",
        "icon-lg": "h-[52px] w-[52px] rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
