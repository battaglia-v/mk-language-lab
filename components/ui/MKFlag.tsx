'use client';

import { cn } from '@/lib/utils';

interface MKFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Macedonian Flag Emoji Component
 * 
 * Uses the native 🇲🇰 emoji for consistent, recognizable display.
 */
export function MKFlag({ className, size = 'md' }: MKFlagProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <span
      className={cn(sizeClasses[size], 'leading-none', className)}
      role="img"
      aria-label="Macedonian flag"
    >
      🇲🇰
    </span>
  );
}

export default MKFlag;
