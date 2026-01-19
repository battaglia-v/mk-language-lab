'use client';

/**
 * DifficultyIndicator - Shows current adaptive difficulty level
 * 
 * Visual indicator for the current difficulty level during
 * adaptive practice sessions.
 * 
 * Features:
 * - Color-coded difficulty badge
 * - Animated transitions when difficulty changes
 * - Tooltip with accuracy info
 * 
 * Parity: Must match Android DifficultyIndicator.tsx
 */

import { useState, useEffect } from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DifficultyLevel } from '@/lib/learn/adaptive-difficulty';

interface DifficultyIndicatorProps {
  /** Current difficulty level */
  difficulty: DifficultyLevel;
  /** Rolling accuracy (0-1) */
  accuracy?: number;
  /** Whether adaptive mode is active */
  isAdaptive?: boolean;
  /** Number of adjustments made */
  adjustmentsMade?: number;
  /** Show compact version */
  compact?: boolean;
  /** Additional class name */
  className?: string;
}

const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  easy: {
    label: 'Easy',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  hard: {
    label: 'Advanced',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
};

export function DifficultyIndicator({
  difficulty,
  accuracy,
  isAdaptive = true,
  adjustmentsMade = 0,
  compact = false,
  className,
}: DifficultyIndicatorProps) {
  const [showTransition, setShowTransition] = useState(false);
  const [previousDifficulty, setPreviousDifficulty] = useState(difficulty);

  const config = DIFFICULTY_CONFIG[difficulty];

  // Animate difficulty changes
  useEffect(() => {
    if (difficulty !== previousDifficulty) {
      setShowTransition(true);
      const timer = setTimeout(() => {
        setShowTransition(false);
        setPreviousDifficulty(difficulty);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [difficulty, previousDifficulty]);

  // Determine trend icon
  const getTrendIcon = () => {
    if (!isAdaptive || adjustmentsMade === 0) {
      return <Minus className="h-3 w-3" />;
    }
    const levels: DifficultyLevel[] = ['easy', 'medium', 'hard'];
    const prevIndex = levels.indexOf(previousDifficulty);
    const currIndex = levels.indexOf(difficulty);
    
    if (currIndex > prevIndex) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (currIndex < prevIndex) {
      return <TrendingDown className="h-3 w-3 text-amber-500" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
          config.bgColor,
          config.borderColor,
          config.color,
          showTransition && 'animate-pulse',
          className
        )}
        title={`Difficulty: ${config.label}${accuracy !== undefined ? ` | Accuracy: ${Math.round(accuracy * 100)}%` : ''}`}
      >
        <Gauge className="h-3 w-3" />
        {config.label}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3',
        config.bgColor,
        config.borderColor,
        showTransition && 'animate-pulse',
        className
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full',
        config.bgColor
      )}>
        <Gauge className={cn('h-5 w-5', config.color)} />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={cn('font-semibold', config.color)}>
            {config.label}
          </span>
          {isAdaptive && adjustmentsMade > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon()}
            </span>
          )}
        </div>
        
        {accuracy !== undefined && (
          <p className="text-xs text-muted-foreground">
            Rolling accuracy: {Math.round(accuracy * 100)}%
          </p>
        )}
        
        {isAdaptive && (
          <p className="text-xs text-muted-foreground">
            {adjustmentsMade === 0
              ? 'Adaptive mode active'
              : `${adjustmentsMade} adjustment${adjustmentsMade !== 1 ? 's' : ''} made`
            }
          </p>
        )}
      </div>

      {/* Transition indicator */}
      {showTransition && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-ping" />
      )}
    </div>
  );
}

export default DifficultyIndicator;
