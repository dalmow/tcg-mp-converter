import type { ComponentProps } from 'react'
import { Card } from './Card'
import { cn } from '@/shared/lib/utils'

/** Solid themed panel (no translucency), built on the shadcn Card. */
export function Panel({ className, ...props }: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn('bg-surface-100 text-ink ring-0 border border-border-faint', className)}
      {...props}
    />
  )
}
