import { cva } from 'class-variance-authority'

const primaryStyle =
  'status-border border-secondary bg-primary text-ink hover:border-secondary-strong hover:bg-primary-hover'
const dangerStyle = 'status-border border-danger bg-danger text-ink hover:border-danger-hover hover:bg-danger-hover'
const ghostStyle =
  'border-border bg-transparent text-ink hover:border-divider-accent hover:bg-secondary-tint-strong aria-expanded:border-divider-accent aria-expanded:bg-secondary-tint-strong'

// Design system: three variants (primary, danger, ghost).
export const buttonVariants = cva(
  "group/button inline-flex cursor-pointer shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-ui whitespace-nowrap transition-all outline-none select-none focus-visible:border-ink-faint focus-visible:ring-1 focus-visible:ring-ink-faint active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: primaryStyle,
        danger: dangerStyle,
        ghost: ghostStyle,
      },
      size: {
        default: 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        sm: "h-7 gap-1 rounded-md px-2.5 text-ui in-data-[slot=button-group]:rounded-none has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        icon: 'size-8',
        'icon-sm': 'size-7 rounded-sm in-data-[slot=button-group]:rounded-none',
        'icon-lg': 'size-9 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)
