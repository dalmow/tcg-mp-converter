import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-border bg-surface-100 px-2.5 py-2 text-body text-ink transition-colors outline-none placeholder:text-ink-faint focus-visible:border-ink-faint focus-visible:ring-1 focus-visible:ring-ink-faint disabled:cursor-not-allowed disabled:bg-surface-000 disabled:opacity-45 aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
