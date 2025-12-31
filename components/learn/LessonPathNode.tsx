'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LessonNode, LessonNodeStatus } from '@/lib/learn/lesson-path-types';
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
  /** Position in the path for zigzag layout */
  index: number;
  /** Whether this is the "Continue" node */
  isContinueNode?: boolean;
}

const nodeIcons = {
  lesson: BookOpen,
  review: RefreshCw,
  story: BookMarked,
  checkpoint: Trophy,
};

const statusColors: Record<LessonNodeStatus, string> = {
  locked: 'bg-muted/50 text-muted-foreground border-muted',
  available: 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25',
  in_progress: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25',
  completed: 'bg-green-500 text-white border-green-500',
};

const statusRingColors: Record<LessonNodeStatus, string> = {
  locked: 'ring-muted/30',
  available: 'ring-primary/40',
  in_progress: 'ring-amber-500/40',
  completed: 'ring-green-500/30',
};

export function LessonPathNode({ node, locale, index, isContinueNode }: LessonPathNodeProps) {
  const Icon = nodeIcons[node.type];
  const isClickable = node.status === 'available' || node.status === 'in_progress';
  const href = node.href ? `/${locale}${node.href}` : undefined;

  // Zigzag pattern: alternate left/center/right
  const positions = ['ml-0', 'ml-12', 'ml-6', 'ml-16', 'ml-4'];
  const positionClass = positions[index % positions.length];

  const nodeContent = (
    <div
      className={cn(
        'relative flex flex-col items-center transition-all duration-200',
        positionClass,
        isClickable && 'cursor-pointer hover:scale-105 active:scale-95',
        !isClickable && 'cursor-not-allowed opacity-70'
      )}
    >
      {/* Node circle */}
      <div
        className={cn(
          'relative flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all',
          statusColors[node.status],
          statusRingColors[node.status],
          isContinueNode && 'ring-4 ring-offset-2 ring-offset-background animate-pulse',
          node.status === 'completed' && 'h-14 w-14'
        )}
      >
        {node.status === 'locked' ? (
          <Lock className="h-6 w-6" />
        ) : node.status === 'completed' ? (
          <Check className="h-7 w-7" strokeWidth={3} />
        ) : (
          <Icon className="h-7 w-7" />
        )}

        {/* XP badge */}
        {node.status !== 'completed' && node.status !== 'locked' && (
          <div className="absolute -bottom-1 -right-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-amber-900 shadow-sm">
            +{node.xpReward}
          </div>
        )}

        {/* Continue indicator */}
        {isContinueNode && (
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Node label */}
      <div className="mt-2 text-center max-w-[120px]">
        <p
          className={cn(
            'text-sm font-semibold leading-tight',
            node.status === 'locked' && 'text-muted-foreground',
            node.status === 'completed' && 'text-green-600 dark:text-green-400',
            (node.status === 'available' || node.status === 'in_progress') && 'text-foreground'
          )}
        >
          {node.title}
        </p>
        {node.titleMk && node.status !== 'locked' && (
          <p className="text-xs text-muted-foreground mt-0.5">{node.titleMk}</p>
        )}
      </div>

      {/* Connector line to next node */}
      <div
        className={cn(
          'absolute top-full left-1/2 w-1 h-8 -translate-x-1/2 mt-1',
          node.status === 'completed'
            ? 'bg-gradient-to-b from-green-500 to-green-500/30'
            : 'bg-gradient-to-b from-muted/50 to-transparent'
        )}
        aria-hidden="true"
      />
    </div>
  );

  if (isClickable && href) {
    return (
      <Link href={href} prefetch={true}>
        {nodeContent}
      </Link>
    );
  }

  return nodeContent;
}
