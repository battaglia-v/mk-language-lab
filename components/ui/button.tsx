import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-transparent font-semibold tracking-tight transition-[transform,colors,background-color,border-color,box-shadow] duration-150 ease-out disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-3 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-[var(--font-size-sm)] leading-[var(--line-height-tight)]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_0_20px_-6px_var(--primary)] hover:bg-primary/85 hover:shadow-[0_0_35px_-8px_var(--primary)]",
        destructive:
          "bg-destructive text-white shadow-[0_0_25px_-8px_var(--destructive)] hover:bg-destructive/90 focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80",
        outline:
          "border-border/40 bg-background/80 shadow-[0_15px_35px_-25px_rgba(0,0,0,0.65)] hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_0_20px_-6px_var(--secondary)] hover:bg-secondary/80 hover:shadow-[0_0_35px_-8px_var(--secondary)]",
        ghost:
          "hover:bg-primary/5 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "min-h-[var(--button-height-md)] rounded-2xl px-[var(--button-pad-x-md)] py-[var(--button-pad-y)] has-[>svg]:px-[calc(var(--button-pad-x-md)-0.35rem)]",
        sm:
          "min-h-[var(--button-height-sm)] rounded-xl gap-1.5 px-[var(--button-pad-x-sm)] py-[calc(var(--button-pad-y)-0.1rem)] has-[>svg]:px-[calc(var(--button-pad-x-sm)-0.25rem)]",
        lg:
          "min-h-[var(--button-height-lg)] rounded-3xl px-[var(--button-pad-x-lg)] py-[calc(var(--button-pad-y)+0.15rem)] text-[var(--font-size-lg)] has-[>svg]:px-[calc(var(--button-pad-x-lg)-0.45rem)]",
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
