import * as React from 'react'
import { cn } from 'cn'

// One outer radius clips the buttons; the 1px gap shows the container's
// divider-accent background as the seam, so no button carries a border.
function ButtonGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="button-group"
      role="group"
      className={cn(
        'inline-flex h-9 w-fit gap-px overflow-hidden rounded-md bg-divider-accent [&>*]:h-full [&>*]:rounded-none [&>*]:border-0',
        className,
      )}
      {...props}
    />
  )
}

export { ButtonGroup }
