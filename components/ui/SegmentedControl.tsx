'use client';

import { cn } from '@/lib/utils';

type Option<T extends string> = { value: T; label: string; disabled?: boolean };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, size = 'md', className }: Props<T>) {
  return (
    <div className={cn(
      'inline-flex rounded-xl border border-border/60 bg-muted/20 p-1',
      className
    )}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => !opt.disabled && onChange(opt.value)}
          disabled={opt.disabled}
          className={cn(
            'rounded-lg font-medium transition-all',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
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
