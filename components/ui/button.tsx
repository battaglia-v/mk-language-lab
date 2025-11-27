import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-[var(--icon-gap)] whitespace-nowrap rounded-[var(--radius-control)] border border-transparent font-semibold leading-tight tracking-tight shadow-[var(--shadow-sm)] transition-[background-color,border-color,box-shadow,color] duration-120 ease-out disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[var(--icon-size)] [&_svg]:stroke-[var(--icon-stroke)] [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-3 focus-visible:ring-offset-background focus-visible:shadow-[var(--shadow-focus)] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-[var(--font-size-sm)]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-md)] hover:bg-primary/85 hover:shadow-[var(--shadow-lg)]",
        destructive:
          "bg-destructive text-white shadow-[var(--shadow-md)] hover:bg-destructive/90 focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80",
        outline:
          "border-border/50 bg-background/80 shadow-[var(--shadow-sm)] hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-md)] hover:bg-secondary/80 hover:shadow-[var(--shadow-lg)]",
        ghost: "hover:bg-primary/5 hover:text-primary shadow-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "min-h-[var(--button-height-md)] rounded-[var(--radius-control)] px-[var(--button-pad-x-md)] py-[var(--button-pad-y)] has-[>svg]:px-[calc(var(--button-pad-x-md)-0.35rem)]",
        sm:
          "min-h-[var(--button-height-sm)] rounded-[calc(var(--radius-control)-2px)] gap-[calc(var(--icon-gap)-2px)] px-[var(--button-pad-x-sm)] py-[calc(var(--button-pad-y)-0.1rem)] has-[>svg]:px-[calc(var(--button-pad-x-sm)-0.25rem)]",
        lg:
          "min-h-[var(--button-height-lg)] rounded-[calc(var(--radius-control)+4px)] px-[var(--button-pad-x-lg)] py-[calc(var(--button-pad-y)+0.15rem)] text-[var(--font-size-lg)] has-[>svg]:px-[calc(var(--button-pad-x-lg)-0.45rem)]",
        icon: "size-12",
        "icon-sm": "h-11 w-11",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
