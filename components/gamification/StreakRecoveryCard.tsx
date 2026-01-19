'use client';

/**
 * StreakRecoveryCard - Supportive messaging for streak status
 * 
 * Shows different states:
 * - Streak protected by freeze
 * - Streak lost (with encouragement)
 * - Streak at risk (motivational nudge)
 * - Freeze available notification
 * 
 * Parity: Must match Android StreakRecoveryCard.tsx
 */

import { useState } from 'react';
import { Flame, Shield, Heart, Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StreakState = 
  | 'protected'      // Streak was saved by freeze
  | 'lost'           // Streak was lost
  | 'at-risk'        // User hasn't practiced today
  | 'freeze-ready'   // Freeze is available to use
  | 'healthy';       // Streak is fine

interface StreakRecoveryCardProps {
  /** Current streak state */
  state: StreakState;
  /** Current streak count */
  streak: number;
  /** Previous streak (before lost) */
  previousStreak?: number;
  /** Days since last activity */
  daysMissed?: number;
  /** Whether streak freeze is available */
  freezeAvailable?: boolean;
  /** Callback when card is dismissed */
  onDismiss?: () => void;
  /** Callback to start practicing */
  onStartPractice?: () => void;
  /** Additional class name */
  className?: string;
}

const STATE_CONFIG: Record<StreakState, {
  icon: typeof Flame;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  title: string;
  emoji: string;
}> = {
  protected: {
    icon: Shield,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    title: 'Streak Protected!',
    emoji: '🛡️',
  },
  lost: {
    icon: Heart,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    title: 'Welcome Back!',
    emoji: '💪',
  },
  'at-risk': {
    icon: Flame,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    title: 'Keep Your Streak!',
    emoji: '🔥',
  },
  'freeze-ready': {
    icon: Shield,
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    title: 'Streak Freeze Ready',
    emoji: '❄️',
  },
  healthy: {
    icon: Sparkles,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    title: 'Great Progress!',
    emoji: '✨',
  },
};

export function StreakRecoveryCard({
  state,
  streak,
  previousStreak,
  daysMissed,
  freezeAvailable,
  onDismiss,
  onStartPractice,
  className,
}: StreakRecoveryCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  if (isDismissed || state === 'healthy') {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getMessage = (): string => {
    switch (state) {
      case 'protected':
        return `Your ${streak}-day streak was saved by a streak freeze! You have a second chance — practice today to keep it going.`;
      case 'lost':
        if (previousStreak && previousStreak > 7) {
          return `You had an amazing ${previousStreak}-day streak! Don't worry — every expert was once a beginner. Start fresh today!`;
        }
        return `It's okay to miss a day. What matters is coming back. Let's start a new streak together!`;
      case 'at-risk':
        return `Your ${streak}-day streak is waiting for you! Complete a quick lesson to keep it alive.`;
      case 'freeze-ready':
        return `Good news! You have a streak freeze available. If you miss a day, your streak will be protected automatically.`;
      default:
        return '';
    }
  };

  const getActionLabel = (): string => {
    switch (state) {
      case 'protected':
        return 'Practice Now';
      case 'lost':
        return 'Start Fresh';
      case 'at-risk':
        return 'Quick Lesson';
      case 'freeze-ready':
        return 'Got It';
      default:
        return 'Continue';
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4',
        config.bgColor,
        config.borderColor,
        'animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
          config.bgColor
        )}>
          <span className="text-2xl">{config.emoji}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {config.title}
            </h3>
            {state === 'at-risk' && streak > 0 && (
              <span className="flex items-center gap-1 text-orange-500 text-sm font-bold">
                <Flame className="h-4 w-4" />
                {streak}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {getMessage()}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {state !== 'freeze-ready' && onStartPractice && (
              <Button
                size="sm"
                onClick={onStartPractice}
                className="gap-1"
              >
                {getActionLabel()}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {state === 'freeze-ready' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
              >
                {getActionLabel()}
              </Button>
            )}
            {freezeAvailable && state === 'at-risk' && (
              <span className="text-xs text-cyan-500 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Freeze ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreakRecoveryCard;
