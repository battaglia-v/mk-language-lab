'use client';

import { ReactNode } from 'react';
import { LucideIcon, Inbox, Search, FileQuestion, Wifi, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'offline' | 'loading';

interface EmptyStateProps {
  /** Icon to display - can be a LucideIcon or custom React node */
  icon?: LucideIcon | ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Additional class name */
  className?: string;
  /** Children for custom content */
  children?: ReactNode;
}

const VARIANT_CONFIG: Record<EmptyStateVariant, {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}> = {
  default: {
    icon: Inbox,
    iconColor: 'text-muted-foreground',
    bgColor: 'bg-muted/10',
    borderColor: 'border-border/40',
  },
  search: {
    icon: Search,
    iconColor: 'text-primary/60',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-destructive',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/20',
  },
  offline: {
    icon: Wifi,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
  },
  loading: {
    icon: FileQuestion,
    iconColor: 'text-muted-foreground animate-pulse',
    bgColor: 'bg-muted/5',
    borderColor: 'border-border/20',
  },
};

/**
 * EmptyState - Consistent empty state component for the app
 * 
 * Use this component when:
 * - A list/grid has no items
 * - Search returned no results
 * - An error occurred loading content
 * - User is offline
 * 
 * @example
 * <EmptyState
 *   title="No lessons found"
 *   description="Try adjusting your filters or start a new search"
 *   action={{ label: "Clear filters", onClick: clearFilters }}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
  children,
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];
  
  // Determine which icon to render
  const renderIcon = () => {
    if (icon) {
      // Check if it's a LucideIcon (function component) or ReactNode
      if (typeof icon === 'function') {
        const IconComponent = icon as LucideIcon;
        return <IconComponent className={cn("h-10 w-10", config.iconColor)} aria-hidden="true" />;
      }
      return icon;
    }
    
    const DefaultIcon = config.icon;
    return <DefaultIcon className={cn("h-10 w-10", config.iconColor)} aria-hidden="true" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border p-8 text-center",
        config.bgColor,
        config.borderColor,
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon container */}
      <div className={cn(
        "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl",
        config.bgColor.replace('/5', '/20').replace('/10', '/30')
      )}>
        {renderIcon()}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {/* Custom children */}
      {children && (
        <div className="mt-4 w-full">
          {children}
        </div>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className="rounded-full px-6"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="rounded-full px-4 text-muted-foreground"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured empty states for common use cases
 */

interface NoResultsProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}

export function NoResultsState({ searchTerm, onClearSearch, className }: NoResultsProps) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={
        searchTerm
          ? `We couldn't find anything matching "${searchTerm}"`
          : "Try adjusting your search or filters"
      }
      action={
        onClearSearch
          ? { label: "Clear search", onClick: onClearSearch }
          : undefined
      }
      className={className}
    />
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description={message || "We encountered an error loading this content. Please try again."}
      action={
        onRetry
          ? { label: "Try again", onClick: onRetry, variant: 'outline' }
          : undefined
      }
      className={className}
    />
  );
}

interface OfflineStateProps {
  onRetry?: () => void;
  className?: string;
}

export function OfflineState({ onRetry, className }: OfflineStateProps) {
  return (
    <EmptyState
      variant="offline"
      title="You're offline"
      description="Check your internet connection and try again"
      action={
        onRetry
          ? { label: "Retry", onClick: onRetry, variant: 'outline' }
          : undefined
      }
      className={className}
    />
  );
}

interface ComingSoonStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ComingSoonState({ 
  title = "Coming Soon",
  description = "This feature is currently in development. Check back later!",
  className,
}: ComingSoonStateProps) {
  return (
    <EmptyState
      variant="default"
      title={title}
      description={description}
      className={className}
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
        Coming Soon
      </div>
    </EmptyState>
  );
}

