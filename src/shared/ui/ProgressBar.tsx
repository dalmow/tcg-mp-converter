import * as React from 'react'
import { cn } from 'cn'

type ProgressBarProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Accessible name of the bar. Not shown: the count beside the bar is the only visible signal. */
  label: string
  value: number
  max: number
}

/** The deck list progress: a 6px track with the literal count beside it. */
function ProgressBar({ className, label, value, max, ...props }: ProgressBarProps) {
  const ratio = max > 0 ? value / max : 0
  const percent = Math.min(100, Math.max(0, ratio * 100))

  return (
    <div data-slot="progress-bar" className={cn('flex items-center gap-space-4', className)} {...props}>
      <div className="flex-1">
        {/* The design system bar has 3px corners on its 6px track. */}
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.min(value, max)}
          className="h-1.5 w-full overflow-hidden rounded-[3px] bg-border-faint"
        >
          <div
            className="h-full rounded-[3px] bg-linear-to-r from-danger to-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="shrink-0 text-caption font-bold text-ink-muted">{`${value}/${max}`}</span>
    </div>
  )
}

export { ProgressBar }
