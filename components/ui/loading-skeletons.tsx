'use client';

/**
 * Loading Skeleton Components
 * 
 * Reusable skeleton loaders for consistent loading states
 * across the application. All skeletons use the shimmer animation
 * and adapt to light/dark themes automatically.
 */

import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

// =============================================================================
// BASE SKELETONS
// =============================================================================

export function TextSkeleton({ 
  className,
  lines = 1,
  lastLineWidth = '75%' 
}: { 
  className?: string;
  lines?: number;
  lastLineWidth?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ 
            width: i === lines - 1 && lines > 1 ? lastLineWidth : '100%' 
          }}
        />
      ))}
    </div>
  );
}

export function AvatarSkeleton({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton 
      className={cn('rounded-full', sizeClasses[size], className)} 
    />
  );
}

// =============================================================================
// CARD SKELETONS
// =============================================================================

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border/50 bg-card p-4',
        className
      )}
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <TextSkeleton lines={2} lastLineWidth="60%" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function NewsCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border/50 bg-card',
        className
      )}
    >
      {/* Image placeholder */}
      <Skeleton className="aspect-video w-full rounded-none" />
      
      <div className="space-y-3 p-4">
        {/* Category badge */}
        <Skeleton className="h-5 w-16 rounded-full" />
        
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        
        {/* Meta info */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function LessonCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border/50 bg-card p-4',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon placeholder */}
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        
        <div className="flex-1 space-y-2">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />
          {/* Description */}
          <Skeleton className="h-4 w-full" />
          {/* Progress bar */}
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function PracticeCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border/50 bg-card p-6',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Icon */}
        <Skeleton className="h-16 w-16 rounded-full" />
        
        {/* Title */}
        <Skeleton className="h-6 w-32" />
        
        {/* Description */}
        <Skeleton className="h-4 w-48" />
        
        {/* Button */}
        <Skeleton className="h-12 w-full rounded-[var(--radius-control)]" />
      </div>
    </div>
  );
}

// =============================================================================
// DASHBOARD SKELETONS
// =============================================================================

export function DailyGoalSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] bg-gradient-to-br from-accent/20 to-accent/5 p-6',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        
        {/* Progress ring placeholder */}
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function StreakSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[var(--radius-card)] border border-border/50 bg-card p-4',
        className
      )}
    >
      {/* Flame icon */}
      <Skeleton className="h-10 w-10 rounded-full" />
      
      <div className="space-y-1">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function RecommendationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border/50 bg-card p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        
        {/* Action button */}
        <Skeleton className="h-8 w-16 shrink-0" />
      </div>
    </div>
  );
}

// =============================================================================
// LIST SKELETONS
// =============================================================================

export function ListSkeleton({ 
  items = 3, 
  ItemComponent = CardSkeleton,
  className,
  gap = 4,
}: { 
  items?: number;
  ItemComponent?: React.ComponentType<{ className?: string }>;
  className?: string;
  gap?: number;
}) {
  return (
    <div className={cn(`space-y-${gap}`, className)}>
      {Array.from({ length: items }).map((_, i) => (
        <ItemComponent key={i} />
      ))}
    </div>
  );
}

export function GridSkeleton({ 
  items = 4, 
  ItemComponent = CardSkeleton,
  columns = 2,
  className,
}: { 
  items?: number;
  ItemComponent?: React.ComponentType<{ className?: string }>;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', columnClasses[columns], className)}>
      {Array.from({ length: items }).map((_, i) => (
        <ItemComponent key={i} />
      ))}
    </div>
  );
}

// =============================================================================
// FULL PAGE SKELETONS
// =============================================================================

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-48" />
        </div>
        <AvatarSkeleton size="lg" />
      </div>

      {/* Daily Goal */}
      <DailyGoalSkeleton />

      {/* Streak and Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StreakSkeleton />
        <StreakSkeleton />
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <ListSkeleton items={3} ItemComponent={RecommendationSkeleton} />
      </div>
    </div>
  );
}

export function LessonsSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Progress overview */}
      <div className="rounded-[var(--radius-card)] border border-border/50 bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-2 flex-1 mx-4 rounded-full" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>

      {/* Lesson list */}
      <ListSkeleton items={5} ItemComponent={LessonCardSkeleton} />
    </div>
  );
}

export function NewsFeedSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
        ))}
      </div>

      {/* News cards */}
      <GridSkeleton items={4} ItemComponent={NewsCardSkeleton} columns={2} />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <AvatarSkeleton size="xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 rounded-lg border border-border/50 bg-card p-4">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Achievement cards */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <GridSkeleton items={6} ItemComponent={PracticeCardSkeleton} columns={3} />
      </div>
    </div>
  );
}
