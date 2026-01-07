'use client';

import { BookOpen, RefreshCw, Shuffle, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VocabCounts } from './useVocabulary';

/**
 * Practice mode for vocabulary sessions
 */
export type PracticeMode = 'learn-new' | 'review-due' | 'mixed' | 'all';

interface PracticeModeSelectorProps {
  counts: VocabCounts;
  selectedMode: PracticeMode;
  onModeSelect: (mode: PracticeMode) => void;
}

type ModeConfig = {
  id: PracticeMode;
  label: string;
  description: string;
  icon: typeof BookOpen;
  getCount: (counts: VocabCounts) => number;
  countLabel: string;
  variant: 'new' | 'due' | 'mixed' | 'all';
};

const modes: ModeConfig[] = [
  {
    id: 'learn-new',
    label: 'Learn New',
    description: 'Study words you haven\'t seen yet',
    icon: BookOpen,
    getCount: (counts) => counts.new,
    countLabel: 'new',
    variant: 'new',
  },
  {
    id: 'review-due',
    label: 'Review Due',
    description: 'Practice words ready for review',
    icon: RefreshCw,
    getCount: (counts) => counts.due,
    countLabel: 'due',
    variant: 'due',
  },
  {
    id: 'mixed',
    label: 'Mixed Practice',
    description: 'Blend of new words and reviews',
    icon: Shuffle,
    getCount: (counts) => counts.new + counts.due,
    countLabel: 'words',
    variant: 'mixed',
  },
  {
    id: 'all',
    label: 'All Words',
    description: 'Your complete vocabulary',
    icon: Library,
    getCount: (counts) => counts.total,
    countLabel: 'total',
    variant: 'all',
  },
];

/**
 * PracticeModeSelector - Card-based selector for vocabulary practice modes
 *
 * Allows users to choose between learning new words, reviewing due words,
 * mixed practice, or accessing their full vocabulary.
 */
export function PracticeModeSelector({
  counts,
  selectedMode,
  onModeSelect,
}: PracticeModeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Practice Mode
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to practice your vocabulary
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modes.map((mode) => (
          <ModeCard
            key={mode.id}
            config={mode}
            count={mode.getCount(counts)}
            isSelected={selectedMode === mode.id}
            onClick={() => onModeSelect(mode.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual mode card
 */
function ModeCard({
  config,
  count,
  isSelected,
  onClick,
}: {
  config: ModeConfig;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = config.icon;

  const variantStyles = {
    new: {
      base: 'border-emerald-500/30 bg-emerald-500/5',
      selected: 'border-emerald-500 bg-emerald-500/15 ring-1 ring-emerald-500/30',
      icon: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    },
    due: {
      base: 'border-amber-500/30 bg-amber-500/5',
      selected: 'border-amber-500 bg-amber-500/15 ring-1 ring-amber-500/30',
      icon: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
    },
    mixed: {
      base: 'border-primary/30 bg-primary/5',
      selected: 'border-primary bg-primary/15 ring-1 ring-primary/30',
      icon: 'bg-primary/20 text-primary',
      badge: 'bg-primary/20 text-primary',
    },
    all: {
      base: 'border-border bg-card',
      selected: 'border-foreground/50 bg-accent ring-1 ring-foreground/20',
      icon: 'bg-muted text-muted-foreground',
      badge: 'bg-muted text-muted-foreground',
    },
  };

  const styles = variantStyles[config.variant];
  const isEmpty = count === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isEmpty && config.id !== 'all'}
      className={cn(
        'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200',
        'min-h-[100px] active:scale-[0.98]',
        isSelected ? styles.selected : styles.base,
        isEmpty && config.id !== 'all' && 'opacity-50 cursor-not-allowed'
      )}
      data-testid={`practice-mode-${config.id}`}
    >
      {/* Icon and badge row */}
      <div className="flex w-full items-start justify-between gap-2">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            styles.icon
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Count badge */}
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            styles.badge
          )}
        >
          {count} {config.countLabel}
        </span>
      </div>

      {/* Label and description */}
      <div className="space-y-0.5">
        <h4 className="text-sm font-semibold text-foreground">{config.label}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
      </div>
    </button>
  );
}
