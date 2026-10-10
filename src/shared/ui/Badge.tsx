import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'

// `accent` is the design system `chip-accent`.
// The `cn` merge drops a named text size (`text-caption`) that sits next to a text color, so the caption
// token (11px, 600) is written as an arbitrary length from its CSS variable.
const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border border-transparent px-2 py-0.5 font-[weight:var(--text-caption--font-weight)] text-[length:var(--text-caption)] leading-[var(--text-caption--line-height)] whitespace-nowrap transition-all focus-visible:border-ink-faint focus-visible:ring-1 focus-visible:ring-ink-faint has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-danger [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        accent: 'border-secondary-border-soft bg-secondary-tint-strong text-secondary',
      },
    },
    defaultVariants: {
      variant: 'accent',
    },
  },
)

function Badge({
  className,
  variant = 'accent',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge }
