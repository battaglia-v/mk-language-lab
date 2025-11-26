import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--icon-gap)] whitespace-nowrap rounded-[var(--radius-control)] border border-transparent text-sm font-semibold leading-tight tracking-tight shadow-[var(--shadow-sm)] transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[var(--icon-size)] [&_svg]:stroke-[1.6] [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[var(--shadow-focus)] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:-translate-y-0.5 active:translate-y-0",
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
        default: "h-12 px-7 py-2.5 has-[>svg]:px-5",
        sm: "h-10 rounded-[calc(var(--radius-control)-2px)] gap-[calc(var(--icon-gap)-2px)] px-4 has-[>svg]:px-3 text-sm",
        lg: "h-14 rounded-[calc(var(--radius-control)+4px)] px-9 has-[>svg]:px-7 text-base",
        icon: "size-12",
        "icon-sm": "size-10",
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
