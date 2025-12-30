'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  days: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlight';
  className?: string;
};

export function StreakPill({ days, size = 'md', variant = 'default', className }: Props) {
  const isActive = days > 0;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-semibold',
      sizeClasses[size],
      variant === 'highlight' && isActive
        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30'
        : isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-muted/30 text-muted-foreground border border-border/40',
      className
    )}>
      <Flame className={cn(iconSizes[size], isActive && 'text-orange-500')} />
      <span>{days}</span>
    </div>
  );
}
