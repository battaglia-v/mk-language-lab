import { Flame, Heart, MoreVertical, Shield, Zap } from 'lucide-react';
import { WebProgressRing, WebStatPill } from '@mk/ui';
import { cn } from '@/lib/utils';
import { getLevelInfo } from '@/components/learn/quick-practice/utils';
import type { Level } from '@/components/learn/quick-practice/types';

type QuickPracticeHeaderProps = {
  title: string;
  summarySubtitle?: string;
  isModalVariant: boolean;
  isInputFocused: boolean;
  streak: number;
  hearts: number;
  level: Level;
  xp: number;
  sessionProgress: number;
  progressValueLabel: string;
  progressLabel: string;
  accuracyBadgeLabel: string;
  accuracyValueLabel: string;
  accuracyAccent: 'green' | 'gold' | 'red';
  categoryValue: string;
  categoryLabelText: string;
  inlineProgressLabel: string;
  onToggleSettings: () => void;
};

export function QuickPracticeHeader({
  title,
  summarySubtitle,
  isModalVariant,
  isInputFocused,
  streak,
  hearts,
  level,
  xp,
  sessionProgress,
  progressValueLabel,
  progressLabel,
  accuracyBadgeLabel,
  accuracyValueLabel,
  accuracyAccent,
  categoryValue,
  categoryLabelText,
  inlineProgressLabel,
  onToggleSettings,
}: QuickPracticeHeaderProps) {
  const levelInfo = getLevelInfo(level);

  return (
    <div className={cn('space-y-2 md:space-y-4', isModalVariant ? 'px-6 py-4 md:px-10 md:py-8 lg:px-12' : 'py-3 md:py-4')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className={cn('text-lg font-semibold text-foreground md:text-2xl', isModalVariant && 'md:text-3xl')}>
            {title}
          </h2>
          {summarySubtitle ? (
            <p className={cn('hidden md:block text-sm text-muted-foreground', isModalVariant && 'md:text-base')}>
              {summarySubtitle}
            </p>
          ) : null}
        </div>

        <div className="flex md:hidden items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 border border-orange-500/20">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{streak}</span>
          </div>
          <div className="flex items-center gap-0.5">
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
          {!isInputFocused && (
            <button
              type="button"
              onClick={onToggleSettings}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors ml-auto"
              aria-label="Toggle settings"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 border border-orange-500/20">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{streak}</span>
          </div>
          <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 border', levelInfo.bgColor, levelInfo.borderColor)}>
            <Shield className={cn('h-4 w-4', levelInfo.color)} />
            <span className={cn('text-xs font-bold', levelInfo.color)}>{levelInfo.label}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 border border-yellow-500/20">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-600">{xp}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Heart
                key={index}
                className={cn(
                  'h-5 w-5 transition-all duration-200',
                  index < hearts ? 'fill-[var(--brand-red)] text-[var(--brand-red)]' : 'fill-muted text-muted'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 md:hidden">
        <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-[var(--brand-green)]" aria-hidden="true" />
          <span aria-live="polite">{inlineProgressLabel}</span>
        </div>
      </div>

      {!isInputFocused && (
        <div className="md:hidden flex items-center gap-2">
          <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 border text-xs', levelInfo.bgColor, levelInfo.borderColor)}>
            <Shield className={cn('h-3.5 w-3.5', levelInfo.color)} />
            <span className={cn('font-bold', levelInfo.color)}>{levelInfo.label}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 border border-yellow-500/20">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-600">{xp} XP</span>
          </div>
        </div>
      )}

      {!isInputFocused && (
        <div className="mt-4 hidden gap-4 md:grid md:grid-cols-[auto,1fr] items-center">
          <WebProgressRing
            progress={sessionProgress / 100}
            value={progressValueLabel}
            label={progressLabel}
            style={{ margin: '0 auto' }}
          />
          <div className="flex flex-wrap gap-2">
            <WebStatPill label={accuracyBadgeLabel} value={accuracyValueLabel} accent={accuracyAccent} />
            <WebStatPill label={categoryLabelText} value={categoryValue} accent="gold" />
          </div>
        </div>
      )}
    </div>
  );
}
