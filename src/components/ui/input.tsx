import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-base text-ink md:text-sm",
          "transition-colors duration-200 placeholder:text-ink-faint",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
          "hover:border-ink-faint",
          "focus-visible:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
