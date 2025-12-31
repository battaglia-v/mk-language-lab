'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { BookOpen, Wrench, BookmarkPlus, Zap, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { ReadingSampleCard } from '@/components/reader/ReadingSampleCard';
import { getReaderSamplesByLocale } from '@/lib/reader-samples';
import { readFavorites } from '@/lib/favorites';
import { cn } from '@/lib/utils';

/**
 * Reader Library - Clean reading-first experience
 *
 * Shows available readings and saved words count.
 * Analyze tool is accessible via icon, not front-and-center.
 */
export default function ReaderPage() {
  const locale = useLocale();
  const samples = useMemo(() => getReaderSamplesByLocale('mk'), []);
  const [savedCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return readFavorites().length;
  });

  return (
    <div className="min-h-screen pb-24 sm:pb-6">
      {/* Hero Section */}
      <header className="px-4 py-8 text-center">
        <div className="max-w-lg mx-auto space-y-3">
          <h1 className="text-3xl font-bold">Read & Learn</h1>
          <p className="text-muted-foreground">
            Tap any word while reading to see its translation.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>{samples.length} texts</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookmarkPlus className="h-4 w-4 text-amber-500" />
            <span>{savedCount} saved</span>
          </div>
        </div>
      </header>

      <PageContainer size="lg" className="space-y-8">
        {/* Review Saved Words CTA */}
        {savedCount > 0 && (
          <Link
            href={`/${locale}/reader/review`}
            className={cn(
              'flex items-center gap-4 rounded-2xl p-4',
              'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
              'border border-amber-500/30 hover:border-amber-500/50',
              'transition-all hover:shadow-lg'
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Review saved words</p>
              <p className="text-sm text-muted-foreground">{savedCount} words ready to practice</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        {/* Reading Library */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Library</h2>
            <Link
              href={`/${locale}/reader/analyze`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Wrench className="h-4 w-4" />
              <span>Analyze text</span>
            </Link>
          </div>

          {samples.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {samples.map((sample) => (
                <ReadingSampleCard
                  key={sample.id}
                  sample={sample}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No readings available yet.</p>
            </div>
          )}
        </section>

        {/* Add Custom Text */}
        <section className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center">
          <h3 className="font-semibold mb-2">Have your own text?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Paste any Macedonian text to read with word-by-word translations.
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={`/${locale}/reader/analyze`}>
              <Wrench className="h-4 w-4 mr-2" />
              Open Text Analyzer
            </Link>
          </Button>
        </section>
      </PageContainer>
    </div>
  );
}
