'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ReaderWorkspace } from '@/components/reader/ReaderWorkspace';
import type { ReaderDirectionOption } from '@/components/translate/useReaderWorkspace';

/**
 * Reader page - Word-by-word translation and analysis
 *
 * Features:
 * - Longer text input (articles, stories)
 * - Word-by-word breakdown
 * - Interactive vocabulary learning
 * - Part of speech tagging
 * - Difficulty analysis
 * - Import from URL or file
 */
export default function ReaderPage() {
  const t = useTranslations('translate');

  const directionOptions: ReaderDirectionOption[] = useMemo(
    () => [
      {
        id: 'en-mk',
        sourceLang: 'en',
        targetLang: 'mk',
        label: t('directions.en_mk'),
        placeholder: t('readerInputPlaceholder'),
      },
      {
        id: 'mk-en',
        sourceLang: 'mk',
        targetLang: 'en',
        label: t('directions.mk_en'),
        placeholder: t('readerInputPlaceholder'),
      },
    ],
    [t],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-24 sm:gap-6 sm:pb-10">
      {/* Header */}
      <header className="space-y-3 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/10 via-background/70 to-secondary/10 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t('title', { default: 'Reader' })}
          </h1>
          <span className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
            Word-by-Word
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-foreground/80">
            Smart Reveal
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-foreground/80">
            Import &amp; Analyze
          </span>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base max-w-3xl">
          {t('readerEmptyDescription', {
            default: 'Paste any text to see each word\'s translation, part of speech, difficulty level, and a full translation. Tap to reveal words, copy the full translation, or import an article.'
          })}
        </p>
      </header>

      {/* Reader Workspace */}
      <ReaderWorkspace
        directionOptions={directionOptions}
        defaultDirectionId="en-mk"
      />
    </div>
  );
}
