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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-24 sm:gap-5 sm:pb-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t('title', { default: 'Reader' })}
          </h1>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Word-by-Word
          </span>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t('readerEmptyDescription', {
            default: 'Paste any text to see each word\'s translation, part of speech, and difficulty level.'
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
