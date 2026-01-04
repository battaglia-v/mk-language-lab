import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary - Gold accent (main CTA)
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
        // Secondary - Subtle surface
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
        // Ghost - No background
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        // Outline - Border only
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        // Destructive - Danger action
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90",
        // Link - Text only
        link:
          "text-primary underline-offset-4 hover:underline",
        // Choice - For quiz/practice options
        choice:
          "border-2 border-border bg-card hover:border-primary/60 hover:bg-primary/5 data-[selected=true]:border-primary data-[selected=true]:bg-primary/10 data-[correct=true]:border-green-500 data-[correct=true]:bg-green-500/10 data-[incorrect=true]:border-red-500 data-[incorrect=true]:bg-red-500/10",
      },
      size: {
        // Default = 48px (standard)
        default: "h-12 px-6 rounded-[var(--radius)] text-base",
        // Small = 44px (compact, meets tap target)
        sm: "h-11 px-4 rounded-[var(--radius-sm)] text-sm",
        // Large = 56px (hero CTA)
        lg: "h-14 px-8 rounded-[var(--radius)] text-lg",
        // Icon buttons
        icon: "size-12 rounded-[var(--radius-sm)]",
        "icon-sm": "size-11 rounded-[var(--radius-sm)]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
