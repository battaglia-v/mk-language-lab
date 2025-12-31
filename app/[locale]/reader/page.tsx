'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { BookOpen, Wrench, BookmarkPlus, Zap, ChevronRight, Library, FileText } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingSampleCard } from '@/components/reader/ReadingSampleCard';
import { getReaderSamplesByLocale } from '@/lib/reader-samples';
import { readFavorites } from '@/lib/favorites';
import { cn } from '@/lib/utils';

/**
 * Reader - Library | Workspace tabs
 *
 * Library: Browse curated readings
 * Workspace: Continue recent reading or start new
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
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-center">Reader</h1>
      </header>

      <PageContainer size="lg">
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="library" className="gap-2">
              <Library className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="workspace" className="gap-2">
              <FileText className="h-4 w-4" />
              Workspace
            </TabsTrigger>
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
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
                  <p className="text-sm text-muted-foreground">{savedCount} words ready</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}

            {/* Reading List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Curated Readings</h2>
                <span className="text-sm text-muted-foreground">{samples.length} texts</span>
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
          </TabsContent>

          {/* Workspace Tab */}
          <TabsContent value="workspace" className="space-y-6">
            {/* Quick start */}
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-lg font-semibold mb-2">Reading Workspace</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select a text from the Library or analyze your own
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button asChild>
                  <Link href={`/${locale}/reader/analyze`}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Analyze Custom Text
                  </Link>
                </Button>
              </div>
            </div>

            {/* Saved words shortcut */}
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <BookmarkPlus className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Review saved words</p>
                  <p className="text-sm text-muted-foreground">{savedCount} words</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>
    </div>
  );
}
