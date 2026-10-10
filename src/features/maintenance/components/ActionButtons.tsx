import type { ComponentProps } from 'react'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/utils'

/** Blue confirm/save button. */
export function SaveButton({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button className={cn('bg-primary text-ink hover:bg-primary-hover', className)} {...props} />
}
