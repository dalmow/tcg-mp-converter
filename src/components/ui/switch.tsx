"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "cn"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-pill border-y border-transparent bg-clip-padding transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-1 focus-visible:ring-ring aria-invalid:ring-1 aria-invalid:ring-destructive/20 data-[size=default]:h-6 data-[size=default]:w-10 data-[size=sm]:h-6 data-[size=sm]:w-8 data-checked:bg-secondary data-unchecked:bg-border data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* Slot: 20px (sm: 16px) cell with a 1px margin; the knob inside is 18px (sm: 14px), so it sits 2px from the track edge. */}
      <span
        aria-hidden
        className="pointer-events-none ml-px flex items-center justify-center transition-transform group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4 group-data-checked/switch:group-data-[size=default]/switch:translate-x-4.5 group-data-checked/switch:group-data-[size=sm]/switch:translate-x-3.5"
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className="pointer-events-none block rounded-pill bg-surface-000 ring-0 group-data-[size=default]/switch:size-4.5 group-data-[size=sm]/switch:size-3.5"
        />
      </span>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
