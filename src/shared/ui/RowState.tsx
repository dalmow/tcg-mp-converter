import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

// One state pattern for a row or an inline input. Color is the only cue here;
// the icon-plus-sentence companion line is owned by the screen using it.
const rowStateVariants = cva('rounded-md', {
  variants: {
    state: {
      pendency: 'status-border border-danger bg-danger-tint',
      complete: 'status-border border-secondary bg-secondary-tint',
      noop: 'border border-dashed border-border-dashed bg-white/3',
    },
  },
})

type RowStateName = NonNullable<VariantProps<typeof rowStateVariants>['state']>

function RowState({ className, state, ...props }: React.ComponentProps<'div'> & { state: RowStateName }) {
  return (
    <div data-slot="row-state" data-state={state} className={cn(rowStateVariants({ state }), className)} {...props} />
  )
}

export { RowState }
export type { RowStateName }
