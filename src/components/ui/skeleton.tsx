import { cn } from "@/lib/utils"

/** Shimmering placeholder block with a light sweep. */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-surface-2",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-ink/5 after:to-transparent",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }

