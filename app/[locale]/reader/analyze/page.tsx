'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReaderWorkspace } from '@/components/reader/ReaderWorkspace';
import type { ReaderDirectionOption } from '@/components/translate/useReaderWorkspace';
import { PageContainer } from '@/components/layout';

/**
 * Reader Analyze - Text analysis tool
 *
 * Paste or import text for word-by-word analysis.
 * This is the "tool" view, separate from the reading experience.
 */
export default function ReaderAnalyzePage() {
  const locale = useLocale();

  const directionOptions: ReaderDirectionOption[] = useMemo(
    () => [
      {
        id: 'mk-en',
        sourceLang: 'mk',
        targetLang: 'en',
        label: 'Macedonian → English',
        placeholder: 'Paste Macedonian text here...',
      },
      {
        id: 'en-mk',
        sourceLang: 'en',
        targetLang: 'mk',
        label: 'English → Macedonian',
        placeholder: 'Paste English text here...',
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen pb-24 sm:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Link href={`/${locale}/reader`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold">Text Analyzer</h1>
            <p className="text-xs text-muted-foreground">Break down any text into words and meaning.</p>
          </div>
        </div>
      </header>

      <PageContainer size="xl" className="pt-6">
        <ReaderWorkspace
          directionOptions={directionOptions}
          defaultDirectionId="mk-en"
        />
      </PageContainer>
    </div>
  );
}
