'use client';

/**
 * Empty State Components
 * 
 * Consistent empty state displays across the application.
 * Each component includes an icon, title, description, and optional action.
 */

import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Flame, 
  Inbox, 
  Newspaper, 
  Search, 
  Trophy,
  Mic,
  Lightbulb,
  Clock,
  Star,
  type LucideIcon 
} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  iconClassName?: string;
  compact?: boolean;
}

// =============================================================================
// BASE EMPTY STATE
// =============================================================================

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
  iconClassName,
  compact = false,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-3 py-6' : 'gap-4 py-12',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full bg-muted/50',
          compact ? 'p-3' : 'p-4',
          iconClassName
        )}
      >
        <Icon 
          className={cn(
            'text-muted-foreground',
            compact ? 'h-6 w-6' : 'h-10 w-10'
          )} 
        />
      </div>
      
      <div className="space-y-1">
        <h3 className={cn(
          'font-semibold text-foreground',
          compact ? 'text-base' : 'text-lg'
        )}>
          {title}
        </h3>
        {description && (
          <p className={cn(
            'text-muted-foreground max-w-sm mx-auto',
            compact ? 'text-sm' : 'text-base'
          )}>
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
          {action && (
            <Button onClick={action.onClick} size={compact ? 'sm' : 'default'}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="outline" 
              onClick={secondaryAction.onClick}
              size={compact ? 'sm' : 'default'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// =============================================================================
// PRESET EMPTY STATES
// =============================================================================

interface PresetEmptyStateProps {
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function EmptyLessons({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No lessons yet"
      description="Start your Macedonian learning journey by exploring our beginner lessons."
      action={onAction ? { label: 'Browse Lessons', onClick: onAction } : undefined}
      className={className}
      compact={compact}
    />
  );
}

export function EmptyStreak({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Flame}
      title="Start your streak"
      description="Complete your first lesson today to begin building your learning streak."
      action={onAction ? { label: 'Start Learning', onClick: onAction } : undefined}
      className={className}
      compact={compact}
      iconClassName="bg-orange-500/10"
    />
  );
}

export function EmptyNews({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Newspaper}
      title="No news available"
      description="We couldn&apos;t load the latest news. Check back later or try refreshing."
      action={onAction ? { label: 'Refresh', onClick: onAction } : undefined}
      className={className}
      compact={compact}
    />
  );
}

export function EmptySearch({ 
  query,
  onClear,
  className,
  compact 
}: PresetEmptyStateProps & { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={
        query 
          ? `We couldn't find anything matching "${query}". Try different keywords.`
          : 'Try searching for words, lessons, or topics.'
      }
      action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
      className={className}
      compact={compact}
    />
  );
}

export function EmptyAchievements({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Trophy}
      title="No achievements yet"
      description="Complete lessons and challenges to earn your first badge."
      action={onAction ? { label: 'View Challenges', onClick: onAction } : undefined}
      className={className}
      compact={compact}
      iconClassName="bg-yellow-500/10"
    />
  );
}

export function EmptyPronunciation({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Mic}
      title="No recordings yet"
      description="Practice your pronunciation by recording yourself speaking Macedonian."
      action={onAction ? { label: 'Start Practice', onClick: onAction } : undefined}
      className={className}
      compact={compact}
      iconClassName="bg-blue-500/10"
    />
  );
}

export function EmptyRecommendations({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Lightbulb}
      title="All caught up!"
      description="You&apos;ve completed all your recommended activities. Great work!"
      action={onAction ? { label: 'Explore More', onClick: onAction } : undefined}
      className={className}
      compact={compact}
      iconClassName="bg-green-500/10"
    />
  );
}

export function EmptyHistory({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Clock}
      title="No history yet"
      description="Your learning activity will appear here as you complete lessons."
      action={onAction ? { label: 'Start Learning', onClick: onAction } : undefined}
      className={className}
      compact={compact}
    />
  );
}

export function EmptyFavorites({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Star}
      title="No favorites yet"
      description="Save words or lessons you want to review later."
      action={onAction ? { label: 'Browse Content', onClick: onAction } : undefined}
      className={className}
      compact={compact}
      iconClassName="bg-yellow-500/10"
    />
  );
}

// =============================================================================
// GENERIC ERROR EMPTY STATE
// =============================================================================

interface ErrorEmptyStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorEmptyState({
  title = 'Something went wrong',
  description = 'We encountered an error loading this content. Please try again.',
  onRetry,
  className,
  compact,
}: ErrorEmptyStateProps) {
  return (
    <EmptyState
      icon={Inbox}
      title={title}
      description={description}
      action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
      className={className}
      compact={compact}
      iconClassName="bg-destructive/10"
    />
  );
}

// =============================================================================
// OFFLINE STATE
// =============================================================================

export function OfflineState({ onAction, className, compact }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={Inbox}
      title="You&apos;re offline"
      description="Check your internet connection and try again."
      action={onAction ? { label: 'Retry', onClick: onAction } : undefined}
      className={className}
      compact={compact}
      iconClassName="bg-gray-500/10"
    />
  );
}
