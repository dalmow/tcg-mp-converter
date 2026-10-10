import * as React from 'react'
import { cn } from 'cn'

type ProgressBarProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** Eyebrow caption on the left of the label row. */
  label: string
  value: number
  max: number
  /** Unit shown after the total, e.g. "cartas" renders "/60 cartas". */
  suffix?: string
  /** Bare bar with the count beside it; the label stays as the accessible name only. */
  compact?: boolean
}

function ProgressBar({ className, label, value, max, suffix, compact, ...props }: ProgressBarProps) {
  const labelId = React.useId()
  const ratio = max > 0 ? value / max : 0
  const percent = Math.min(100, Math.max(0, ratio * 100))
  // The design system bar has 3px corners on its 6px track.
  const track = (
    <div
      role="progressbar"
      {...(compact ? { 'aria-label': label } : { 'aria-labelledby': labelId })}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className="h-1.5 w-full overflow-hidden rounded-[3px] bg-border-faint"
    >
      <div className="h-full rounded-[3px] bg-linear-to-r from-danger to-primary" style={{ width: `${percent}%` }} />
    </div>
  )

  if (compact) {
    return (
      <div data-slot="progress-bar" className={cn('flex items-center gap-space-4', className)} {...props}>
        <div className="flex-1">{track}</div>
        <span className="shrink-0 text-caption font-bold text-ink-muted">{`${value}/${max}`}</span>
      </div>
    )
  }

  return (
    <div data-slot="progress-bar" className={cn('flex flex-col gap-space-2', className)} {...props}>
      <div className="flex items-baseline justify-between gap-space-3">
        <span id={labelId} className="text-eyebrow text-ink-faint">
          {label}
        </span>
        <span className="text-body-strong">
          <span className="text-ink">{value}</span>
          <span className="text-ink-subtle">{suffix ? `/${max} ${suffix}` : `/${max}`}</span>
        </span>
      </div>
      {track}
    </div>
  )
}

export { ProgressBar }
