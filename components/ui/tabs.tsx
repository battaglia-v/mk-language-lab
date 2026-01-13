"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Modern segmented control container
        "relative inline-flex w-full items-center justify-center",
        // Background and shape
        "bg-muted/50 rounded-xl p-1",
        // Touch-friendly height
        "min-h-[48px]",
        // Text color for inactive state
        "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base styles - keep above indicator with z-10
        "relative z-10 inline-flex flex-1 items-center justify-center gap-2",
        "rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap",
        // Touch-friendly sizing
        "min-h-[40px]",
        // Smooth transitions for color and transform
        "transition-all duration-200 ease-out",
        // Inactive state
        "text-muted-foreground cursor-pointer",
        "hover:text-foreground/80",
        // Active state - pill indicator appears
        "data-[state=active]:text-foreground",
        "data-[state=active]:bg-background",
        "data-[state=active]:shadow-sm",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Icons
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
