import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
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
        'relative space-y-2 rounded-xl border border-border/50 bg-card/50 p-3 transition-all duration-200 md:p-4',
        isInputFocused && 'ring-2 ring-primary/20',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {categoryLabel}
        </span>
      </div>
      <p
        className={cn(
          'break-words font-bold leading-tight text-slate-900 dark:text-white',
          isModalVariant ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl',
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
        <div className="space-y-2 rounded-lg border border-border/50 bg-background/60 p-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{audioLabel}</p>
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
