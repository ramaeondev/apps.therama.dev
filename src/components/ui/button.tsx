import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-[background-color,border-color,color,box-shadow] duration-200 ease-smooth",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-action text-action-ink shadow-sm hover:bg-action-hover active:scale-[0.99]",
        subtle:
          "bg-action-soft text-action-soft-ink hover:bg-action-soft/70",
        outline:
          "border border-line-strong bg-surface text-ink hover:border-ink-faint hover:bg-surface-2",
        secondary:
          "bg-surface-2 text-ink hover:bg-surface-3",
        ghost:
          "text-ink-muted hover:bg-surface-2 hover:text-ink",
        destructive:
          "bg-danger text-white shadow-sm hover:bg-danger/90",
        link:
          "text-action underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 [&_svg]:size-4",
        sm: "h-9 rounded-md px-3 text-[0.8125rem] [&_svg]:size-3.5",
        lg: "h-11 rounded-lg px-6 [&_svg]:size-4",
        icon: "h-10 w-10 [&_svg]:size-4",
        "icon-sm": "h-8 w-8 rounded-md [&_svg]:size-4",
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

