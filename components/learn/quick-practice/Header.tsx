import { Flame, Heart, Zap } from 'lucide-react';
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
}: QuickPracticeHeaderProps) {
  const shouldCollapseHud = isMobileViewport && isInputFocused;

  return (
    <div className={cn('space-y-1.5 md:space-y-2', isModalVariant ? 'px-6 py-3 md:px-10 md:py-6 lg:px-12' : 'py-2 md:py-3')}>
      {/* Title section */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className={cn('text-base font-semibold text-foreground md:text-xl', isModalVariant && 'md:text-2xl')}>
            {title}
          </h2>
          {summarySubtitle && (
            <span className="text-xs font-medium text-primary">
              {summarySubtitle}
            </span>
          )}
        </div>
      </div>

      {/* Main stats bar - always visible */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-foreground">
          {progressValueLabel}
        </span>
        <span className="text-muted-foreground">•</span>
        <span className="inline-flex items-center gap-1 text-foreground">
          <Heart className="h-3 w-3 fill-[var(--brand-red)] text-[var(--brand-red)]" aria-hidden="true" />
          {hearts}/5
        </span>
      </div>

      {/* HUD - collapses completely on mobile input focus */}
      {!shouldCollapseHud && (
        <div
          data-testid="practice-hud"
          className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground md:text-sm"
        >
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
            {streak}
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-yellow-500" aria-hidden="true" />
            {xp} XP
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="text-muted-foreground">{difficultyLabelText}:</span>
            <span className="text-foreground">{difficultyName}</span>
          </span>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {inlineProgressLabel}
      </p>
    </div>
  );
}
