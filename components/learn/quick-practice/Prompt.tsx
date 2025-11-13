import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type QuickPracticePromptProps = {
  label: string;
  content: ReactNode;
  categoryLabel: string;
  isClozeMode: boolean;
  clozeTranslation?: string | null;
  clozeTranslationLabel: string;
  isInputFocused: boolean;
  isModalVariant: boolean;
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
}: QuickPracticePromptProps) {
  return (
    <div
      className={cn(
        'relative space-y-2 rounded-2xl bg-[color:var(--surface-elevated)] p-4 md:p-6 md:rounded-3xl shadow-lg border border-border/60',
        isInputFocused && 'sticky top-0 z-20 shadow-xl md:shadow-lg md:static p-3 md:p-6',
        'transition-all duration-200 hover:shadow-xl'
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={cn(
          'break-words font-bold text-slate-900 dark:text-white leading-tight',
          isModalVariant ? 'text-4xl' : isInputFocused ? 'text-xl' : 'text-2xl md:text-3xl'
        )}
      >
        {content}
      </p>
      <Badge
        variant="secondary"
        className={cn('mt-2 w-fit text-xs font-semibold bg-surface-frosted text-brand-secondary border-none', isInputFocused && 'mt-1')}
      >
        {categoryLabel}
      </Badge>
      {isClozeMode && clozeTranslation ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{clozeTranslationLabel}:</span> {clozeTranslation}
        </p>
      ) : null}
    </div>
  );
}
