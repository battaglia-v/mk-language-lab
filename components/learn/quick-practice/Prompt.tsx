import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import type { PracticeAudioClip } from '@/components/learn/quick-practice/types';

type QuickPracticePromptProps = {
  label: string;
  content: ReactNode;
  categoryLabel: string;
  isClozeMode: boolean;
  clozeTranslation?: string | null;
  clozeTranslationLabel: string;
  isInputFocused: boolean;
  isModalVariant: boolean;
  audioClip?: PracticeAudioClip | { url: string };
  audioLabel: string;
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
  audioClip,
  audioLabel,
}: QuickPracticePromptProps) {
  return (
    <div
      className={cn(
        'relative space-y-3 rounded-3xl border border-border/50 bg-gradient-to-br from-background/85 via-card/80 to-muted/70 p-4 shadow-lg transition-all duration-200 md:p-6',
        isInputFocused && 'sticky top-0 z-20 shadow-xl md:shadow-lg md:static',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {label}
        </span>
        <Badge
          variant="secondary"
          className="border-none bg-background/70 text-[11px] font-semibold text-foreground"
        >
          {categoryLabel}
        </Badge>
      </div>
      <p
        className={cn(
          'break-words font-bold leading-tight text-slate-900 dark:text-white',
          isModalVariant ? 'text-4xl' : isInputFocused ? 'text-xl' : 'text-2xl md:text-3xl',
        )}
      >
        {content}
      </p>
      {isClozeMode && clozeTranslation ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{clozeTranslationLabel}:</span> {clozeTranslation}
        </p>
      ) : null}
      {audioClip?.url ? (
        <div className="space-y-2 rounded-2xl border border-border/60 bg-background/80 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{audioLabel}</p>
          <audio
            controls
            preload="metadata"
            src={audioClip.url}
            className="w-full"
          >
            Your browser does not support the audio element.
          </audio>
          {'slowUrl' in audioClip && audioClip.slowUrl ? (
            <audio
              controls
              preload="metadata"
              src={audioClip.slowUrl}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
