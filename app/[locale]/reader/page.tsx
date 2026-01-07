'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpen, Wrench, BookmarkPlus, Zap, ChevronRight, Library, FileText, Search, X } from 'lucide-react';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingSampleCard } from '@/components/reader/ReadingSampleCard';
import { getAllReaderSamples, getReaderSamplesByCategory, type ReaderSample } from '@/lib/reader-samples';
import { readFavorites } from '@/lib/favorites';
import { cn } from '@/lib/utils';
import { useEntitlement } from '@/hooks/use-entitlement';
import { useAppConfig } from '@/hooks/use-app-config';

const DIFFICULTY_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

/**
 * Reader - Library | Workspace tabs
 *
 * Library: Browse curated readings
 * Workspace: Continue recent reading or start new
 */
export default function ReaderPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const allSamples = useMemo(() => getAllReaderSamples(), []);
  const challengeSamples = useMemo(() => getReaderSamplesByCategory('challenge'), []);
  const conversationSamples = useMemo(() => getReaderSamplesByCategory('conversation'), []);
  const storySamples = useMemo(() => getReaderSamplesByCategory('story'), []);
  const { config } = useAppConfig();
  const { entitlement } = useEntitlement();
  const [savedCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return readFavorites().length;
  });

  // Tab state - read from URL query parameter
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabParam === 'workspace' ? 'workspace' : 'library');

  // Update tab when URL changes
  useEffect(() => {
    const newTab = tabParam === 'workspace' ? 'workspace' : 'library';
    setActiveTab(newTab);
  }, [tabParam]);

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === 'library') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', value);
    }
    const queryString = newParams.toString();
    router.replace(`/${locale}/reader${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);

  // Filter samples based on search and difficulty
  const filteredSamples = useMemo(() => {
    let result = allSamples;

    // Filter by difficulty
    if (selectedDifficulty) {
      result = result.filter(sample => sample.difficulty === selectedDifficulty);
    }

    // Filter by search query (title and tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(sample => {
        const titleMatch = sample.title_en.toLowerCase().includes(query) ||
                          sample.title_mk.toLowerCase().includes(query);
        const tagMatch = sample.tags.some(tag => tag.toLowerCase().includes(query));
        return titleMatch || tagMatch;
      });
    }

    return result;
  }, [allSamples, searchQuery, selectedDifficulty]);

  // Get unique difficulties from available samples
  const availableDifficulties = useMemo(() => {
    const difficulties = new Set(allSamples.map(s => s.difficulty));
    return DIFFICULTY_LEVELS.filter(d => difficulties.has(d));
  }, [allSamples]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty(null);
  };

  const hasActiveFilters = searchQuery.trim() || selectedDifficulty;
  const paywallEnabled = config.paywallEnabled;
  const isPro = entitlement.isPro;

  const isPremiumSample = (sample: ReaderSample) => {
    const dayNumber = Number.parseInt(sample.attribution.day ?? '', 10);
    return (
      sample.tags.includes('30-day-challenge') &&
      Number.isFinite(dayNumber) &&
      dayNumber >= 6
    );
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-6">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 text-center">
        <h1 className="text-2xl font-bold">Reader</h1>
        <p className="text-sm text-muted-foreground mt-1">Read real Macedonian — tap any word.</p>
      </header>

      <PageContainer size="lg">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 min-h-[48px]">
            <TabsTrigger value="library" className="gap-2 min-h-[44px]" data-testid="reader-tab-library">
              <Library className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="workspace" className="gap-2 min-h-[44px]" data-testid="reader-tab-workspace">
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
                data-testid="reader-review-saved-cta-library"
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

            {/* Search and Filter */}
            <div className="space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search readings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-h-[48px] pl-10 pr-12"
                  data-testid="reader-search-input"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 text-muted-foreground hover:text-foreground"
                    data-testid="reader-search-clear"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Difficulty Filter Chips */}
              {availableDifficulties.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {availableDifficulties.map((level) => (
                    <Button
                      key={level}
                      variant="outline"
                      onClick={() => setSelectedDifficulty(selectedDifficulty === level ? null : level)}
                      aria-pressed={selectedDifficulty === level}
                      data-active={selectedDifficulty === level ? 'true' : 'false'}
                      className={cn(
                        'rounded-full min-h-[44px] px-4 text-sm font-semibold transition-all',
                        selectedDifficulty === level
                          ? level === 'A1' ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                          : level === 'A2' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                          : level === 'B1' ? 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600'
                          : 'bg-pink-500 text-white border-pink-500 hover:bg-pink-600'
                          : 'bg-transparent hover:border-primary/50'
                      )}
                      data-testid={`reader-filter-difficulty-${level}`}
                    >
                      {level}
                    </Button>
                  ))}
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="rounded-full min-h-[44px] px-4 text-sm font-medium text-muted-foreground"
                      data-testid="reader-filter-clear-all"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Search Results (when filters active) */}
            {hasActiveFilters && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Search Results</h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredSamples.length} of {allSamples.length}
                  </span>
                </div>

                {filteredSamples.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredSamples.map((sample) => {
                      const isPremium = isPremiumSample(sample);
                      const isLocked = paywallEnabled && isPremium && !isPro;

                      return (
                        <ReadingSampleCard
                          key={sample.id}
                          sample={sample}
                          locale={locale}
                          isPremium={isPremium}
                          isLocked={isLocked}
                          ctaHref={
                            isLocked ? `/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/reader`)}` : undefined
                          }
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No readings match your filters.</p>
                    <Button
                      variant="link"
                      onClick={clearFilters}
                      className="mt-2"
                      data-testid="reader-filter-clear-empty"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* Category-based browsing (when no filters) */}
            {!hasActiveFilters && (
              <>
                {/* Reading Challenges Section */}
                <section className="space-y-4" data-testid="reader-challenges-section">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Reading Challenges</h2>
                    <Link
                      href={`/${locale}/learn/paths/30day`}
                      className="text-sm text-primary hover:underline"
                      data-testid="reader-challenges-view-all"
                    >
                      View all {challengeSamples.length} chapters →
                    </Link>
                  </div>

                  {/* 30-Day Challenge Featured */}
                  <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">30-Day Reading Challenge</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">NEW</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Read &ldquo;The Little Prince&rdquo; in Macedonian, one chapter at a time.
                    </p>
                    <Button
                      asChild
                      className="min-h-[44px] rounded-full px-4 text-black"
                      data-testid="reader-30day-start"
                    >
                      <Link href={`/${locale}/reader/samples/day01-maliot-princ`}>
                        Start Day 1
                      </Link>
                    </Button>
                  </div>

                  {/* Preview of challenge content */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {challengeSamples.slice(0, 4).map((sample) => {
                      const isPremium = isPremiumSample(sample);
                      const isLocked = paywallEnabled && isPremium && !isPro;

                      return (
                        <ReadingSampleCard
                          key={sample.id}
                          sample={sample}
                          locale={locale}
                          isPremium={isPremium}
                          isLocked={isLocked}
                          ctaHref={
                            isLocked ? `/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/reader`)}` : undefined
                          }
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Conversations Section */}
                <section className="space-y-4" data-testid="reader-conversations-section">
                  <h2 className="text-lg font-semibold">Conversations</h2>
                  {conversationSamples.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {conversationSamples.map((sample) => (
                        <ReadingSampleCard
                          key={sample.id}
                          sample={sample}
                          locale={locale}
                          isPremium={false}
                          isLocked={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">More conversations coming soon</p>
                  )}
                </section>

                {/* Stories Section */}
                <section className="space-y-4" data-testid="reader-stories-section">
                  <h2 className="text-lg font-semibold">Stories</h2>
                  {storySamples.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {storySamples.map((sample) => (
                        <ReadingSampleCard
                          key={sample.id}
                          sample={sample}
                          locale={locale}
                          isPremium={false}
                          isLocked={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">More stories coming soon</p>
                  )}
                </section>
              </>
            )}
          </TabsContent>

          {/* Workspace Tab */}
          <TabsContent value="workspace" className="space-y-6">
            {/* Quick start */}
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-lg font-semibold mb-2">Reading Workspace</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Paste text and break it down.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Button
                  asChild
                  className="min-h-[48px] active:scale-[0.99]"
                  data-testid="reader-workspace-analyze"
                >
                  <Link href={`/${locale}/reader/analyze`}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Paste text
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-[48px] active:scale-[0.99]"
                  data-testid="reader-workspace-browse-stories"
                >
                  <Link href={`/${locale}/reader?tab=library`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse stories
                  </Link>
                </Button>
              </div>
            </div>

            {/* Saved words shortcut */}
            {savedCount > 0 && (
              <Link
                href={`/${locale}/reader/review`}
                data-testid="reader-review-saved-cta-workspace"
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
