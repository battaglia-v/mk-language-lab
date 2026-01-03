'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Option<T extends string> = { value: T; label: ReactNode; disabled?: boolean };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
  testId?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  ariaLabel,
  testId,
}: Props<T>) {
  return (
    <div className={cn(
      'inline-flex w-full min-w-0 rounded-xl border border-border/60 bg-muted/20 p-1',
      className
    )} role="group" aria-label={ariaLabel} data-testid={testId}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => !opt.disabled && onChange(opt.value)}
          disabled={opt.disabled}
          aria-pressed={value === opt.value}
          data-testid={testId ? `${testId}-${opt.value}` : undefined}
          className={cn(
            'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg font-medium transition-all',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm',
            value === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
            opt.disabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
