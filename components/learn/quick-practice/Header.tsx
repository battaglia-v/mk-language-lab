import { Flame, Heart, Shield, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getLevelInfo } from '@/components/learn/quick-practice/utils';
import type { Level } from '@/components/learn/quick-practice/types';

type QuickPracticeHeaderProps = {
  title: string;
  summarySubtitle?: string;
  isModalVariant: boolean;
  isInputFocused: boolean;
  isMobileViewport: boolean;
  streak: number;
  hearts: number;
  level: Level;
  xp: number;
  accuracyBadgeLabel: string;
  accuracyValueLabel: string;
  categoryValue: string;
  categoryLabelText: string;
  difficultyName: string;
  difficultyLabelText: string;
  inlineProgressLabel: string;
};

export function QuickPracticeHeader({
  title,
  summarySubtitle,
  isModalVariant,
  isInputFocused,
  isMobileViewport,
  streak,
  hearts,
  level,
  xp,
  accuracyBadgeLabel,
  accuracyValueLabel,
  categoryValue,
  categoryLabelText,
  difficultyName,
  difficultyLabelText,
  inlineProgressLabel,
}: QuickPracticeHeaderProps) {
  const levelInfo = getLevelInfo(level);
  const shouldCollapseHud = isMobileViewport && isInputFocused;

  return (
    <div className={cn('space-y-2 md:space-y-4', isModalVariant ? 'px-6 py-4 md:px-10 md:py-8 lg:px-12' : 'py-3 md:py-4')}>
      <div className="flex flex-col gap-2">
        <div className="flex-1 min-w-0 space-y-1">
          {summarySubtitle ? (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 border-primary/30 bg-primary/5 text-xs font-semibold uppercase tracking-wide text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {summarySubtitle}
            </Badge>
          ) : null}
          <h2 className={cn('text-lg font-semibold text-foreground md:text-2xl', isModalVariant && 'md:text-3xl')}>
            {title}
          </h2>
        </div>
      </div>

      <div
        data-testid="practice-hud"
        data-collapsed={shouldCollapseHud}
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-3xl border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold text-foreground transition-all duration-200',
          shouldCollapseHud && 'rounded-full px-3 py-1 text-xs shadow-sm'
        )}
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
          <span>{difficultyName}</span>
        </span>
      </div>

      {!shouldCollapseHud && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 border', levelInfo.bgColor, levelInfo.borderColor)}>
              <Shield className={cn('h-4 w-4', levelInfo.color)} />
              <span className={cn('font-bold', levelInfo.color)}>{levelInfo.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Heart
                  key={index}
                  className={cn(
                    'h-4 w-4 transition-all duration-200',
                    index < hearts ? 'fill-[var(--brand-red)] text-[var(--brand-red)]' : 'fill-muted text-muted'
                  )}
                />
              ))}
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {inlineProgressLabel}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-background/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{accuracyBadgeLabel}</p>
              <p className="text-sm font-semibold text-foreground">{accuracyValueLabel}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{categoryLabelText}</p>
              <p className="text-sm font-semibold text-foreground">{categoryValue}</p>
            </div>
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {inlineProgressLabel}
      </p>
    </div>
  );
}
