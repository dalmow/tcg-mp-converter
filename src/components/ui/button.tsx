import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const primaryStyle =
  "status-border border-secondary bg-primary text-ink hover:border-secondary-strong hover:bg-primary-hover"
const dangerStyle =
  "status-border border-danger bg-danger text-ink hover:border-danger-hover hover:bg-danger-hover"
const ghostStyle =
  "border-border bg-transparent text-ink hover:border-divider-accent hover:bg-secondary-tint-strong aria-expanded:border-divider-accent aria-expanded:bg-secondary-tint-strong"

// Design system: three variants (primary, danger, ghost). `default`, `destructive`,
// `outline` and `secondary` are legacy aliases kept so existing screens keep compiling.
const buttonVariants = cva(
  "group/button inline-flex cursor-pointer shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-ui whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: primaryStyle,
        danger: dangerStyle,
        ghost: ghostStyle,
        default: primaryStyle,
        destructive: dangerStyle,
        outline: ghostStyle,
        secondary: ghostStyle,
        link: "text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-sm px-2 text-caption in-data-[slot=button-group]:rounded-none has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-md px-2.5 text-ui in-data-[slot=button-group]:rounded-none has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 text-body-strong has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-xs in-data-[slot=button-group]:rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-sm in-data-[slot=button-group]:rounded-none",
        "icon-lg": "size-9 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
