'use client'

import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from 'cn'

// The design system toggle: a 40×22px track. The knob slot is 20px with a 1px margin, so the 18px knob sits 2px in.
// The 1px vertical margin keeps the 24px row slot that the layouts around the toggle were built on.
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'group/switch relative my-px inline-flex h-5.5 w-10 shrink-0 items-center rounded-pill bg-clip-padding transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-1 focus-visible:ring-ink-faint aria-invalid:ring-1 aria-invalid:ring-danger/20 data-checked:bg-secondary data-unchecked:bg-border data-disabled:cursor-not-allowed data-disabled:opacity-45',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none ml-px flex size-5 items-center justify-center transition-transform group-data-checked/switch:translate-x-4.5"
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className="pointer-events-none block size-4.5 rounded-pill bg-surface-000 ring-0"
        />
      </span>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
