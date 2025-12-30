'use client';

import { cn } from '@/lib/utils';
import { Button } from './button';
import type { ReactNode } from 'react';

type Props = {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tertiaryLabel?: string;
  onTertiary?: () => void;
  className?: string;
  children?: ReactNode;
};

export function StickyActionBar({
  primaryLabel, onPrimary, primaryDisabled,
  secondaryLabel, onSecondary,
  tertiaryLabel, onTertiary,
  className, children,
}: Props) {
  return (
    <div className={cn(
      'fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-lg px-4 py-3',
      'safe-bottom',
      className
    )}>
      <div className="mx-auto flex max-w-lg items-center gap-2">
        {tertiaryLabel && onTertiary && (
          <Button variant="ghost" size="lg" onClick={onTertiary} className="min-h-[48px] rounded-xl">
            {tertiaryLabel}
          </Button>
        )}
        {secondaryLabel && onSecondary && (
          <Button variant="outline" size="lg" onClick={onSecondary} className="min-h-[48px] rounded-xl flex-1">
            {secondaryLabel}
          </Button>
        )}
        <Button size="lg" onClick={onPrimary} disabled={primaryDisabled} className="min-h-[48px] rounded-xl flex-1">
          {primaryLabel}
        </Button>
        {children}
      </div>
    </div>
  );
}
