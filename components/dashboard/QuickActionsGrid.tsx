'use client';

import Link from 'next/link';
import { Languages, Sparkles, Newspaper, BookOpen, Info, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon map for serialization-safe icon passing from server components
const iconMap: Record<string, LucideIcon> = {
  Languages,
  Sparkles,
  Newspaper,
  BookOpen,
  Info,
};

interface QuickAction {
  id: string;
  /** Icon name (must match key in iconMap) - use string for RSC compatibility */
  iconName: string;
  label: string;
  description?: string;
  href: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  badge?: string;
}

interface QuickActionsGridProps {
  /** Array of quick action items */
  actions: QuickAction[];
  /** Locale for href prefixing */
  locale: string;
  /** Additional class name */
  className?: string;
}

/**
 * QuickActionsGrid - Secondary navigation grid for main features
 * 
 * Displays a grid of quick action cards for Translate, Practice,
 * News, Reader, and other features.
 * 
 * Design requirements:
 * - Fixed min-height for consistent card sizes
 * - Clear visual hierarchy: Icon > Label > Arrow
 * - Touch-friendly targets (min 44px)
 * - Consistent spacing (8/16/24 scale)
 */
export function QuickActionsGrid({
  actions,
  locale,
  className,
}: QuickActionsGridProps) {
  return (
    <section className={cn("space-y-4", className)} aria-label="Quick Actions">
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground px-1">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:gap-4">
        {actions.map((action) => {
          const Icon = iconMap[action.iconName] || Info;
          return (
            <Link
              key={action.id}
              href={`/${locale}${action.href}`}
              className={cn(
                // Base layout - fixed min-height ensures consistent cards
                "group relative flex min-h-[120px] flex-col items-center justify-center gap-3",
                // Card styling with proper spacing
                "rounded-2xl border border-white/8 bg-gradient-to-br p-4",
                action.gradientFrom,
                action.gradientTo,
                // Interactive states
                "transition-all duration-200 ease-out",
                "hover:border-white/16 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] hover:-translate-y-0.5",
                "active:scale-[0.98] active:translate-y-0",
                // Focus states for accessibility
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              {/* Badge - positioned absolutely for consistent icon placement */}
              {action.badge && (
                <span className="absolute -top-2 -right-2 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-lg">
                  {action.badge}
                </span>
              )}

              {/* Icon container - centered with consistent size */}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-white/10 backdrop-blur-sm shadow-sm",
                "transition-all duration-200 group-hover:scale-110 group-hover:bg-white/15"
              )}>
                <Icon 
                  className={cn("h-6 w-6", action.accentColor)} 
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              {/* Label - clear and readable */}
              <span className="text-sm font-semibold text-foreground text-center leading-tight">
                {action.label}
              </span>

              {/* Hover indicator - shows on hover */}
              <ArrowRight 
                className={cn(
                  "absolute bottom-3 right-3 h-4 w-4 text-muted-foreground",
                  "opacity-0 translate-x-1 transition-all duration-200",
                  "group-hover:opacity-60 group-hover:translate-x-0"
                )}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
