import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: 
          "text-foreground hover:bg-muted hover:text-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground shadow-lg shadow-success/25 hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground shadow-lg shadow-warning/25 hover:bg-warning/90",
        // Industrial variants for the PWA
        industrial:
          "bg-primary text-primary-foreground font-bold uppercase tracking-wider shadow-[0_4px_0_0_hsl(var(--primary)/0.5),0_8px_20px_-4px_hsl(var(--primary)/0.4)] hover:shadow-[0_2px_0_0_hsl(var(--primary)/0.5),0_4px_10px_-2px_hsl(var(--primary)/0.4)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none",
        "industrial-outline":
          "border-2 border-primary bg-transparent text-primary font-bold uppercase tracking-wider hover:bg-primary/10 active:bg-primary/20",
        "industrial-secondary":
          "bg-secondary text-secondary-foreground font-bold uppercase tracking-wider shadow-[0_4px_0_0_hsl(var(--border))] hover:shadow-[0_2px_0_0_hsl(var(--border))] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none",
        "industrial-accent":
          "bg-accent text-accent-foreground font-bold uppercase tracking-wider shadow-[0_4px_0_0_hsl(var(--accent)/0.5),0_8px_20px_-4px_hsl(var(--accent)/0.4)] hover:shadow-[0_2px_0_0_hsl(var(--accent)/0.5),0_4px_10px_-2px_hsl(var(--accent)/0.4)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-16 rounded-xl px-10 text-lg",
        // Extra large for industrial touch interfaces
        industrial: "h-20 min-w-[140px] rounded-xl px-6 text-lg",
        "industrial-xl": "h-28 min-w-[160px] rounded-2xl px-8 text-xl",
        icon: "h-11 w-11",
        "icon-lg": "h-14 w-14",
        "icon-xl": "h-20 w-20 rounded-2xl",
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
