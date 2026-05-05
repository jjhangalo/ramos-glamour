import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-widest ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-brand-midnight text-white hover:bg-brand-charcoal shadow-sm",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
        outline:
          "border border-brand-midnight/10 bg-transparent hover:bg-brand-bg/50 text-brand-midnight/60 hover:text-brand-midnight",
        secondary:
          "bg-brand-bg text-brand-midnight hover:bg-brand-bg/80",
        ghost: "hover:bg-brand-bg text-brand-midnight/60 hover:text-brand-midnight",
        link: "text-brand-midnight underline-offset-4 hover:underline",
        gold: "bg-brand-gold text-white hover:bg-[#d4af37] shadow-md",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-3 text-[10px]",
        lg: "h-14 rounded-2xl px-10",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
