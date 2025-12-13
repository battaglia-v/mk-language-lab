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
          'inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60',
          active
            ? 'border-primary bg-primary/15 text-primary'
            : 'border-border/60 bg-white/5 text-foreground/90 hover:border-primary/50 hover:bg-primary/10 hover:text-primary',
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
