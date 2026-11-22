import { Toaster as Sonner, toast } from "sonner"
import { useTheme } from "@/hooks/use-theme-value"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Toasts follow the app's own theme context.
 *
 * Previously this read `next-themes`' `useTheme()`, but no `NextThemesProvider`
 * was ever mounted, so toasts silently stayed on the system theme and could
 * disagree with the rest of the interface.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-ink group-[.toaster]:border-line group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-ink-muted",
          actionButton:
            "group-[.toast]:bg-action group-[.toast]:text-action-ink",
          cancelButton:
            "group-[.toast]:bg-surface-2 group-[.toast]:text-ink-muted",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }

