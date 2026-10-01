import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Blue confirm/save button. */
export function SaveButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn('cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80', className)}
      {...props}
    />
  )
}

/** Red delete button. */
export function DeleteButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn('cursor-pointer bg-danger text-danger-foreground hover:bg-danger/80', className)}
      {...props}
    />
  )
}
