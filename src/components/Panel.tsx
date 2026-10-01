import type { ComponentProps } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Solid themed panel (no translucency), built on the shadcn Card. */
export function Panel({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn('bg-panel text-panel-foreground ring-0 border border-panel-border', className)}
      {...props}
    />
  )
}
