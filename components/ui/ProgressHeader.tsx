'use client';

import { X, ChevronLeft } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

type Props = {
  current: number;
  total: number;
  onBack?: () => void;
  onClose?: () => void;
  showCount?: boolean;
  className?: string;
};

export function ProgressHeader({ current, total, onBack, onClose, showCount = true, className }: Props) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <header className={cn('flex items-center gap-3 px-4 py-3 border-b border-border/40 safe-top', className)}>
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="h-10 w-10 rounded-full p-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {onClose && !onBack && (
        <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 rounded-full p-0">
          <X className="h-5 w-5" />
        </Button>
      )}
      <div className="flex-1">
        <Progress value={progress} className="h-2" />
      </div>
      {showCount && (
        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {current}/{total}
        </span>
      )}
    </header>
  );
}
