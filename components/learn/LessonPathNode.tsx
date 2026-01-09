'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LessonNode, LessonNodeStatus } from '@/lib/learn/lesson-path-types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookOpen,
  RefreshCw,
  BookMarked,
  Trophy,
  Lock,
  Check,
  Play,
} from 'lucide-react';

interface LessonPathNodeProps {
  node: LessonNode;
  locale: string;
  /** Position in the path for layout */
  index: number;
  /** Whether this is the "Continue" node */
  isContinueNode?: boolean;
  /** Total number of nodes in the path */
  totalNodes?: number;
}

const nodeIcons = {
  lesson: BookOpen,
  review: RefreshCw,
  story: BookMarked,
  checkpoint: Trophy,
};

const statusColors: Record<LessonNodeStatus, string> = {
  locked: 'bg-muted/60 text-muted-foreground border-muted/80',
  available: 'bg-primary text-black border-primary shadow-lg shadow-primary/20',
  in_progress: 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20',
  completed: 'bg-green-500 text-white dark:text-black border-green-500',
};

export function LessonPathNode({ node, locale, index, isContinueNode, totalNodes = 10 }: LessonPathNodeProps) {
  const t = useTranslations('learn');
  const Icon = nodeIcons[node.type];
  const isClickable = node.status === 'available' || node.status === 'in_progress';
  const isLocked = node.status === 'locked';
  const isCompleted = node.status === 'completed';
  const isLast = totalNodes ? index === totalNodes - 1 : false;
  const href = node.href ? `/${locale}${node.href}` : undefined;

  // Simple alternating offset for a gentle S-curve
  // Pattern: center, right, center, left, center, right...
  const offset = index % 4;
  const alignClass = offset === 1 ? 'ml-8' : offset === 3 ? 'mr-8' : '';

  const nodeContent = (
    <div className="relative flex flex-col items-center">
      {/* Node circle */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border-[3px] transition-all duration-200',
          isCompleted ? 'h-12 w-12' : 'h-14 w-14',
          statusColors[node.status],
          isClickable && 'hover:scale-110 active:scale-95',
          isContinueNode && 'ring-4 ring-primary/30 ring-offset-2 ring-offset-background'
        )}
      >
        {isLocked ? (
          <Lock className="h-5 w-5 opacity-60" />
        ) : isCompleted ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : (
          <Icon className="h-6 w-6" />
        )}

        {/* XP badge for available nodes */}
        {!isCompleted && !isLocked && (
          <span className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-amber-900">
            +{node.xpReward}
          </span>
        )}

        {/* Continue play icon */}
        {isContinueNode && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white dark:text-black shadow">
            <Play className="h-3 w-3 ml-0.5" fill="currentColor" />
          </span>
        )}
      </div>

      {/* Label */}
      <div className="mt-2 text-center max-w-[100px]">
        <p className={cn(
          'text-xs font-medium leading-tight',
          isLocked && 'text-muted-foreground/70',
          isCompleted && 'text-green-600 dark:text-green-400',
          isClickable && 'text-foreground'
        )}>
          {node.title}
        </p>
      </div>
    </div>
  );

  // Connector line to next node (unless last)
  const connector = !isLast && (
    <div
      className={cn(
        'w-0.5 h-8 mx-auto my-1',
        isCompleted ? 'bg-green-500/50' : 'bg-muted/40'
      )}
      aria-hidden="true"
    />
  );

  const wrapper = (children: React.ReactNode) => (
    <div className={cn('flex flex-col items-center', alignClass)}>
      {children}
      {connector}
    </div>
  );

  if (isClickable && href) {
    return wrapper(
      <Link href={href} prefetch={true} className="block" data-testid={`path-node-${node.id}`}>
        {nodeContent}
      </Link>
    );
  }

  if (isLocked) {
    return wrapper(
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed">{nodeContent}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[180px]">
          <p className="text-xs">{t('lockedTooltip')}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return wrapper(nodeContent);
}
