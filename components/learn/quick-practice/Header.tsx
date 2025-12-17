import { Flame, Heart, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuickPracticeHeaderProps = {
  title: string;
  summarySubtitle?: string;
  isModalVariant: boolean;
  isInputFocused: boolean;
  isMobileViewport: boolean;
  streak: number;
  hearts: number;
  xp: number;
  difficultyName: string;
  difficultyLabelText: string;
  inlineProgressLabel: string;
  progressValueLabel: string;
  reviewMistakesMode?: boolean;
  reviewMistakesLabel?: string;
};

export function QuickPracticeHeader({
  title,
  summarySubtitle,
  isModalVariant,
  isInputFocused,
  isMobileViewport,
  streak,
  hearts,
  xp,
  difficultyName,
  difficultyLabelText,
  inlineProgressLabel,
  progressValueLabel,
  reviewMistakesMode = false,
  reviewMistakesLabel,
}: QuickPracticeHeaderProps) {
  const shouldCollapseHud = isMobileViewport && isInputFocused;

  return (
    <div className={cn('space-y-1.5 md:space-y-2', isModalVariant ? 'px-6 py-3 md:px-10 md:py-6 lg:px-12' : 'py-2 md:py-3')}>
      {/* Title section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className={cn('text-base font-semibold text-foreground md:text-xl', isModalVariant && 'md:text-2xl')}>
              {title}
            </h2>
            {reviewMistakesMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <RotateCcw className="h-3 w-3" />
                {reviewMistakesLabel ?? 'Reviewing Mistakes'}
              </span>
            )}
          </div>
          {summarySubtitle && !reviewMistakesMode && (
            <span className="text-xs font-medium text-primary">
              {summarySubtitle}
            </span>
          )}
        </div>
      </div>

      {/* Main stats bar - always visible */}
      <div className="metadata-row text-xs font-medium text-muted-foreground">
        <span className="metadata-item text-foreground">
          {progressValueLabel}
        </span>
        <span className="card-meta-separator">•</span>
        <span className="metadata-item text-foreground">
          <Heart className="h-3 w-3 fill-[var(--brand-red)] text-[var(--brand-red)]" aria-hidden="true" />
          <span className="count-unit">{hearts}/5</span>
        </span>
      </div>

      {/* HUD - collapses completely on mobile input focus */}
      {!shouldCollapseHud && (
        <div
          data-testid="practice-hud"
          className="metadata-row gap-3 text-xs font-medium text-muted-foreground md:text-sm"
        >
          <span className="metadata-item">
            <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
            <span className="label-nowrap">{streak}</span>
          </span>
          <span className="metadata-item">
            <Zap className="h-3.5 w-3.5 text-yellow-500" aria-hidden="true" />
            <span className="count-unit">{xp} XP</span>
          </span>
          <span className="metadata-item">
            <span className="text-muted-foreground label-nowrap">{difficultyLabelText}:</span>
            <span className="text-foreground label-nowrap">{difficultyName}</span>
          </span>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {inlineProgressLabel}
      </p>
    </div>
  );
}
