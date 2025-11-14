import * as React from 'react';
import { cn } from '@/lib/utils';

type FilterChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ active = false, className, children, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={active}
        data-active={active ? 'true' : undefined}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60',
          active
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border/60 bg-background/70 text-muted-foreground hover:border-primary/50 hover:text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FilterChip.displayName = 'FilterChip';
