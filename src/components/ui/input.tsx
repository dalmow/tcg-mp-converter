import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-border bg-surface-100 px-2.5 py-1 text-body text-ink transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-ui file:text-ink placeholder:text-ink-faint focus-visible:border-ink-faint focus-visible:ring-1 focus-visible:ring-ink-faint disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-000 disabled:opacity-45 aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
