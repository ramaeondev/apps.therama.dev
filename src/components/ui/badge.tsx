import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-action-soft text-action-soft-ink",
        secondary:
          "border-transparent bg-surface-2 text-ink-muted",
        success:
          "border-transparent bg-success-soft text-success-soft-ink",
        warn:
          "border-transparent bg-warn-soft text-warn-soft-ink",
        destructive:
          "border-transparent bg-danger-soft text-danger-soft-ink",
        outline: "border-line-strong text-ink-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
