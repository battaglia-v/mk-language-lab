'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { TranslationHistoryEntry, TranslationDirectionOption } from './useTranslatorWorkspace';

type HistoryListProps = {
  entries: TranslationHistoryEntry[];
  directionLabelMap: Record<TranslationDirectionOption['id'], string>;
  onSelect: (entry: TranslationHistoryEntry) => void;
  emptyTitle: string;
  emptyDescription: string;
  loadLabel: string;
  sourceLabel: string;
  resultLabel: string;
  formatTimestamp: (timestamp: number) => string;
  showSkeleton?: boolean;
  skeletonCount?: number;
};

export function HistoryList({
  entries,
  directionLabelMap,
  onSelect,
  emptyTitle,
  emptyDescription,
  loadLabel,
  sourceLabel,
  resultLabel,
  formatTimestamp,
  showSkeleton = false,
  skeletonCount = 3,
}: HistoryListProps) {
  if (showSkeleton) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Card
            key={`history-skeleton-${index}`}
            className="rounded-2xl border border-white/8 bg-[#0c0f1d]/80 p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
          </Card>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <Card className="rounded-2xl border border-dashed border-white/12 bg-[#0c0f1d]/60 p-6 text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
        <p className="font-semibold text-foreground">{emptyTitle}</p>
        <p className="mt-1">{emptyDescription}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card
          key={entry.id}
          className="rounded-2xl border border-white/8 bg-[#0c0f1d]/80 p-4 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {directionLabelMap[entry.directionId]}
              </p>
              <p className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full border border-white/12 bg-[#161927] px-4 text-xs font-semibold text-foreground shadow-[0_12px_34px_rgba(0,0,0,0.55)] hover:bg-[#1f2333]"
              onClick={() => onSelect(entry)}
            >
              {loadLabel}
            </Button>
          </div>
          <div className="mt-3 grid gap-1 text-sm text-foreground">
            <Row label={sourceLabel} value={entry.sourceText} />
            <Row label={resultLabel} value={entry.translatedText} />
          </div>
        </Card>
      ))}
    </div>
  );
}

type RowProps = {
  label: string;
  value: string;
};

function Row({ label, value }: RowProps) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#111527] px-3 py-2 text-[13px] leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="line-clamp-2 text-foreground/80">{truncate(value, 150)}</p>
    </div>
  );
}

function truncate(text: string, limit: number) {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit)}…`;
}
