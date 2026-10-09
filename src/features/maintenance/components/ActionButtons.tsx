import type { ComponentProps } from 'react'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/utils'

function solidButton(colorClasses: string) {
  return function SolidButton({ className, ...props }: ComponentProps<typeof Button>) {
    return <Button className={cn(colorClasses, className)} {...props} />
  }
}

/** Blue confirm/save button. */
export const SaveButton = solidButton(
  'bg-primary text-ink hover:bg-primary-hover',
)
