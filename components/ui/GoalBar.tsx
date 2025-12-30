'use client';

import { Flame } from 'lucide-react';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

type Props = {
  current: number;
  goal: number;
  label?: string;
  showIcon?: boolean;
  className?: string;
};

export function GoalBar({ current, goal, label, showIcon = true, className }: Props) {
  const progress = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const isComplete = current >= goal;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          {showIcon && <Flame className={cn('h-4 w-4', isComplete ? 'text-primary' : 'text-muted-foreground')} />}
          <span className="font-medium">{label || 'Daily Goal'}</span>
        </div>
        <span className={cn('font-semibold tabular-nums', isComplete ? 'text-primary' : 'text-muted-foreground')}>
          {current}/{goal} XP
        </span>
      </div>
      <Progress value={progress} className={cn('h-2', isComplete && '[&>div]:bg-primary')} />
    </div>
  );
}
