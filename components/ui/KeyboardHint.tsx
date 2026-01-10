'use client';

import { Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

type KeyboardHintProps = {
  show: boolean;
  className?: string;
};

export function KeyboardHint({ show, className }: KeyboardHintProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm text-muted-foreground animate-in fade-in duration-300',
        className
      )}
    >
      <Keyboard className="h-4 w-4" />
      <span>Користете македонска тастатура</span>
    </div>
  );
}
