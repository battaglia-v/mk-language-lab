'use client';

import Link from 'next/link';
import { Languages, Sparkles, Newspaper, BookOpen, Info } from 'lucide-react';
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
 */
export function QuickActionsGrid({
  actions,
  locale,
  className,
}: QuickActionsGridProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {actions.map((action) => {
          const Icon = iconMap[action.iconName] || Info;
          return (
            <Link
              key={action.id}
              href={`/${locale}${action.href}`}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-2xl p-4",
                "border border-border/40 bg-gradient-to-br",
                action.gradientFrom,
                action.gradientTo,
                "transition-all duration-200",
                "hover:border-border/60 hover:shadow-lg hover:scale-[1.02]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              {/* Badge */}
              {action.badge && (
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {action.badge}
                </span>
              )}

              {/* Icon */}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-white/10 backdrop-blur-sm",
                "transition-transform group-hover:scale-110"
              )}>
                <Icon className={cn("h-6 w-6", action.accentColor)} />
              </div>

              {/* Label */}
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>

              {/* Description (optional, hidden on mobile) */}
              {action.description && (
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {action.description}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
