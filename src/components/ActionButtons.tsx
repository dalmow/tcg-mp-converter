import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function solidButton(colorClasses: string) {
  return function SolidButton({ className, ...props }: ComponentProps<typeof Button>) {
    return <Button className={cn(colorClasses, className)} {...props} />
  }
}

/** Blue confirm/save button. */
export const SaveButton = solidButton(
  'bg-primary text-primary-foreground hover:bg-primary-hover',
)
