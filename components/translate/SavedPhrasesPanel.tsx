'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SavedPhraseRecord } from '@/lib/saved-phrases';

export type SavedPhrasesPanelLabels = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  practiceCta: string;
  manageCta: string;
  removeLabel: string;
  clearLabel: string;
  timestampLabel: (value: string) => string;
};

type SavedPhrasesPanelProps = {
  phrases: SavedPhraseRecord[];
  directionLabelMap: Record<string, string>;
  onRemove: (id: string) => void;
  onClear: () => void;
  practiceHref: string;
  manageHref: string;
  labels: SavedPhrasesPanelLabels;
};

export function SavedPhrasesPanel({
  phrases,
  directionLabelMap,
  onRemove,
  onClear,
  practiceHref,
  manageHref,
  labels,
}: SavedPhrasesPanelProps) {
  const hasPhrases = phrases.length > 0;
  return (
    <div className="glass-card rounded-3xl p-5 shadow-lg md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-base font-semibold text-white">{labels.title}</p>
          <p className="text-sm text-slate-300">{labels.description}</p>
        </div>
        {hasPhrases ? (
          <Button
            type="button"
            variant="ghost"
            className="text-sm text-muted-foreground"
            onClick={onClear}
          >
            {labels.clearLabel}
          </Button>
        ) : null}
      </div>

      {hasPhrases ? (
        <div className="mt-4 space-y-4">
          <div className="max-h-[320px] overflow-y-auto pr-1">
            <ul className="space-y-3 pr-2">
              {phrases.map((phrase) => (
                <li
                  key={phrase.id}
                  className="rounded-2xl border border-border/40 bg-background/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {directionLabelMap[phrase.directionId] ?? phrase.directionId}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">{phrase.sourceText}</p>
                      <p className="text-sm text-primary">{phrase.translatedText}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{labels.timestampLabel(phrase.createdAt)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={labels.removeLabel}
                      onClick={() => onRemove(phrase.id)}
                      className="text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="rounded-2xl">
              <Link href={practiceHref}>{labels.practiceCta}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-2xl border-border/60">
              <Link href={manageHref}>{labels.manageCta}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-2xl border border-dashed border-border/50 bg-background/50 p-5 text-sm text-slate-300">
          <p className="text-base font-semibold text-white">{labels.emptyTitle}</p>
          <p>{labels.emptyDescription}</p>
          <Button asChild variant="outline" className="rounded-2xl border-border/60">
            <Link href={manageHref}>{labels.manageCta}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
