import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/utils'

/** The design system `chip-accent`: a static badge, one per deck that uses the card. */
function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex h-5 w-fit shrink-0 items-center justify-center overflow-hidden rounded-pill border border-secondary-border-soft bg-secondary-tint-strong px-space-3 py-0.5 text-caption whitespace-nowrap text-secondary',
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
