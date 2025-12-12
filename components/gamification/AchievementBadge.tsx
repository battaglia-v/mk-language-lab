'use client';

/**
 * AchievementBadge Component
 *
 * Displays an individual achievement/badge with its unlock status,
 * progress bar, and rarity indicator.
 */

import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cardHover, scaleIn } from '@/lib/animations';

export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string; // emoji or icon URL
  isUnlocked: boolean;
  progress?: number; // 0-100
  currentValue?: number;
  targetValue?: number;
  xpReward: number;
  rarityTier: RarityTier;
  className?: string;
  variant?: 'default' | 'compact';
  onClick?: () => void;
}

const RARITY_COLORS: Record<RarityTier, string> = {
  common: 'border-gray-500 bg-gray-500/10 text-gray-700 dark:text-gray-300',
  rare: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  epic: 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300',
  legendary: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

const RARITY_GLOW: Record<RarityTier, string> = {
  common: '',
  rare: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
  epic: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
  legendary: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
};

export function AchievementBadge({
  name,
  description,
  icon,
  isUnlocked,
  progress = 0,
  currentValue,
  targetValue,
  xpReward,
  rarityTier,
  className,
  variant = 'default',
  onClick,
}: AchievementBadgeProps) {
  if (variant === 'compact') {
    return <CompactAchievementBadge {...{ name, icon, isUnlocked, rarityTier, className, onClick }} />;
  }

  return (
    <motion.div
      variants={cardHover}
      whileHover="hover"
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all',
        isUnlocked
          ? cn('border-border bg-card', RARITY_GLOW[rarityTier])
          : 'border-border/50 bg-muted/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Rarity Indicator Bar */}
      <div className={cn('h-1 w-full', RARITY_COLORS[rarityTier].split(' ')[1])} />

      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          {/* Icon */}
          <div
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl border-2 text-3xl',
              isUnlocked
                ? RARITY_COLORS[rarityTier]
                : 'border-border/50 bg-muted/50 grayscale'
            )}
          >
            {isUnlocked ? (
              icon
            ) : (
              <Lock className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* Status Badge */}
          {isUnlocked ? (
            <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1">
              <Check className="h-3 w-3 text-success" />
              <span className="text-xs font-medium text-success">Unlocked</span>
            </div>
          ) : (
            <div className="rounded-full bg-muted px-2 py-1">
              <span className="text-xs font-medium text-muted-foreground">Locked</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="mb-3">
          <h4 className={cn('mb-1 text-base font-bold', isUnlocked ? 'text-foreground' : 'text-muted-foreground')}>
            {name}
          </h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Progress Bar (if not unlocked) */}
        {!isUnlocked && progress !== undefined && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              {currentValue !== undefined && targetValue !== undefined && (
                <span>
                  {currentValue} / {targetValue}
                </span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-accent-2 to-accent-3"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-medium capitalize', RARITY_COLORS[rarityTier].split(' ')[2])}>
            {rarityTier}
          </span>
          <span className="text-xs font-semibold text-accent">+{xpReward} XP</span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact variant - shows just icon and name
 */
function CompactAchievementBadge({
  name,
  icon,
  isUnlocked,
  rarityTier,
  className,
  onClick,
}: Pick<AchievementBadgeProps, 'name' | 'icon' | 'isUnlocked' | 'rarityTier' | 'className' | 'onClick'>) {
  return (
    <motion.div
      variants={scaleIn}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border p-3 transition-all',
        isUnlocked
          ? cn('border-border bg-card hover:bg-muted', RARITY_GLOW[rarityTier])
          : 'border-border/50 bg-muted/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg border text-2xl',
          isUnlocked
            ? RARITY_COLORS[rarityTier]
            : 'border-border/50 bg-muted/50 grayscale'
        )}
      >
        {isUnlocked ? icon : <Lock className="h-5 w-5 text-muted-foreground" />}
      </div>
      <span className={cn('text-xs font-medium text-center', isUnlocked ? 'text-foreground' : 'text-muted-foreground')}>
        {name}
      </span>
    </motion.div>
  );
}

/**
 * Grid container for displaying multiple achievement badges
 */
export function AchievementGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
}

/**
 * Compact grid for smaller badges
 */
export function AchievementCompactGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6', className)}>
      {children}
    </div>
  );
}
