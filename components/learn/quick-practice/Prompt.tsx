import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MasteryLevel = 'new' | 'learning' | 'familiar' | 'practiced' | 'mastered';

const MASTERY_CONFIG: Record<MasteryLevel, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-500/20' },
  learning: { label: 'Learning', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/20' },
  familiar: { label: 'Familiar', color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-500/20' },
  practiced: { label: 'Practiced', color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-500/20' },
  mastered: { label: 'Mastered', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500/20' },
};

type QuickPracticePromptProps = {
  label: string;
  content: ReactNode;
  categoryLabel: string;
  isClozeMode: boolean;
  clozeTranslation?: string | null;
  clozeTranslationLabel: string;
  isInputFocused: boolean;
  isModalVariant: boolean;
  /** Optional mastery level for the current card */
  masteryLevel?: MasteryLevel;
};

export function QuickPracticePrompt({
  label,
  content,
  categoryLabel,
  isClozeMode,
  clozeTranslation,
  clozeTranslationLabel,
  isInputFocused,
  isModalVariant,
  masteryLevel,
}: QuickPracticePromptProps) {
  const masteryConfig = masteryLevel ? MASTERY_CONFIG[masteryLevel] : null;

  return (
    <div
      className={cn(
        'relative space-y-3 rounded-3xl border border-white/10 bg-gradient-to-b from-white/8 via-white/4 to-transparent p-5 shadow-[0_12px_34px_rgba(0,0,0,0.32)] transition-all duration-200 sm:p-6',
        isInputFocused && 'ring-2 ring-primary/25',
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {masteryConfig && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                masteryConfig.bgColor,
                masteryConfig.color,
              )}
            >
              {masteryConfig.label}
            </span>
          )}
        </div>
        <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-foreground/80">{categoryLabel}</span>
      </div>
      <p
        className={cn(
          'break-words font-bold leading-tight text-foreground text-balance',
          isModalVariant ? 'text-3xl md:text-4xl' : 'text-3xl md:text-[34px]',
        )}
      >
        {content}
      </p>
      {isClozeMode && clozeTranslation ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{clozeTranslationLabel}:</span> {clozeTranslation}
        </p>
      ) : null}
    </div>
  );
}
