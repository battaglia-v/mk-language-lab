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
        'relative space-y-3 rounded-3xl border border-white/10 bg-gradient-to-b from-white/8 via-white/4 to-transparent p-5 shadow-[0_12px_34px_rgba(0,0,0,0.32)] transition-all duration-200 sm:p-6',
        isInputFocused && 'ring-2 ring-primary/25',
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>
          {label}
        </span>
        <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-foreground/80">{categoryLabel}</span>
      </div>
      <p
        className={cn(
          'break-words font-bold leading-tight text-slate-50 text-balance',
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
