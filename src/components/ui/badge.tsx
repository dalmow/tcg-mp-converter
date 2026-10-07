import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// `accent` is the design system `chip-accent`. The other variants are legacy and kept for compatibility.
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border border-transparent px-2 py-0.5 text-micro-label whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        accent: "border-secondary-border-soft bg-secondary-tint-strong text-secondary",
        default: "bg-primary text-ink [a]:hover:bg-primary-hover",
        secondary: "bg-secondary text-surface-000 [a]:hover:bg-secondary-strong",
        destructive: "border-danger bg-danger-tint text-danger-soft",
        outline: "border-border text-ink [a]:hover:bg-surface-200",
        ghost: "text-ink-muted hover:bg-surface-200",
        link: "text-primary-text underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "accent",
    },
  }
)

function Badge({
  className,
  variant = "accent",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
