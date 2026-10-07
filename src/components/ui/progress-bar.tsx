import * as React from "react"
import { cn } from "cn"

type ProgressBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Eyebrow caption on the left of the label row. */
  label: string
  value: number
  max: number
  /** Unit shown after the total, e.g. "cartas" renders "/60 cartas". */
  suffix?: string
}

function ProgressBar({
  className,
  label,
  value,
  max,
  suffix,
  ...props
}: ProgressBarProps) {
  const labelId = React.useId()
  const ratio = max > 0 ? value / max : 0
  const percent = Math.min(100, Math.max(0, ratio * 100))

  return (
    <div
      data-slot="progress-bar"
      className={cn("flex flex-col gap-space-2", className)}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-space-3">
        <span id={labelId} className="text-eyebrow text-ink-faint">
          {label}
        </span>
        <span className="text-body-strong">
          <span className="text-ink">{value}</span>
          <span className="text-ink-subtle">
            {suffix ? `/${max} ${suffix}` : `/${max}`}
          </span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-1.5 w-full overflow-hidden rounded-pill bg-border-faint"
      >
        <div
          className="h-full rounded-pill bg-linear-to-r from-danger to-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar }
