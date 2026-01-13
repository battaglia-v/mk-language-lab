'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpen, Wrench, BookmarkPlus, Zap, ChevronRight, Library, FileText, Search, X, Dumbbell, ArrowUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReadingSampleCard } from '@/components/reader/ReadingSampleCard';
import { getAllReaderSamples, getReaderSamplesByCategory, getAvailableTopics, type ReaderSample, type ReaderTopic } from '@/lib/reader-samples';
import { readFavorites } from '@/lib/favorites';
import { readAllProgress, type ReadingProgress } from '@/lib/reading-progress';
import { cn } from '@/lib/utils';
import { useEntitlement } from '@/hooks/use-entitlement';
import { useAppConfig } from '@/hooks/use-app-config';

const DIFFICULTY_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;
type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

const SORT_OPTIONS = ['default', 'difficulty', 'duration', 'progress'] as const;
type SortOption = typeof SORT_OPTIONS[number];

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
  const t = useTranslations('reader');
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

  // Reading progress state - indexed by storyId
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});

  // Load reading progress on mount
  useEffect(() => {
    const allProgress = readAllProgress();
    const map: Record<string, ReadingProgress> = {};
    for (const p of allProgress) {
      map[p.storyId] = p;
    }
    setProgressMap(map);
  }, []);

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
  const [selectedTopic, setSelectedTopic] = useState<ReaderTopic | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Available topics from story samples
  const availableTopics = useMemo(() => getAvailableTopics(), []);

  // Filter and sort samples based on search, difficulty, topic, and sort option
  const filteredSamples = useMemo(() => {
    let result = allSamples;

    // Filter by difficulty
    if (selectedDifficulty) {
      result = result.filter(sample => sample.difficulty === selectedDifficulty);
    }

    // Filter by topic
    if (selectedTopic) {
      result = result.filter(sample => sample.topic === selectedTopic);
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

    // Apply sorting
    if (sortBy !== 'default') {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case 'difficulty': {
            // A1 first, then A2, B1, B2
            const difficultyOrder = { 'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3 };
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          }
          case 'duration': {
            // Shortest first
            return a.estimatedMinutes - b.estimatedMinutes;
          }
          case 'progress': {
            // In-progress first, then unread, then completed
            const progressA = progressMap[a.id];
            const progressB = progressMap[b.id];
            const getProgressScore = (p: ReadingProgress | undefined) => {
              if (!p) return 1; // Unread
              if (p.isCompleted) return 2; // Completed
              if (p.scrollPercent > 0) return 0; // In-progress
              return 1; // Unread
            };
            return getProgressScore(progressA) - getProgressScore(progressB);
          }
          default:
            return 0;
        }
      });
    }

    return result;
  }, [allSamples, searchQuery, selectedDifficulty, selectedTopic, sortBy, progressMap]);

  // Get unique difficulties from available samples
  const availableDifficulties = useMemo(() => {
    const difficulties = new Set(allSamples.map(s => s.difficulty));
    return DIFFICULTY_LEVELS.filter(d => difficulties.has(d));
  }, [allSamples]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty(null);
    setSelectedTopic(null);
  };

  const hasActiveFilters = searchQuery.trim() || selectedDifficulty || selectedTopic;
  const paywallEnabled = config.paywallEnabled;
  const isPro = entitlement.isPro;
  const allReadingsCountLabel = t('sections.allReadingsCount', {
    count: allSamples.length,
    default: `${allSamples.length} texts`,
  });
  const viewAllChaptersLabel = t('sections.viewAllChapters', {
    count: challengeSamples.length,
    default: `View all ${challengeSamples.length} chapters →`,
  });

  const isPremiumSample = (sample: ReaderSample) => {
    const dayNumber = Number.parseInt(sample.attribution.day ?? '', 10);
    return (
      sample.tags.includes('30-day-challenge') &&
      Number.isFinite(dayNumber) &&
      dayNumber >= 6
    );
  };

  // Helper to get progress data for a sample
  const getProgressForSample = (sampleId: string) => {
    const progress = progressMap[sampleId];
    return {
      isCompleted: progress?.isCompleted ?? false,
      progressPercent: progress?.scrollPercent,
    };
  };

  // Find the most recently read in-progress story for "Continue Reading" card
  const continueReadingStory = useMemo(() => {
    const inProgressEntries = Object.values(progressMap)
      .filter((p) => !p.isCompleted && p.scrollPercent > 0)
      .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());

    if (inProgressEntries.length === 0) return null;

    const mostRecent = inProgressEntries[0];
    const sample = allSamples.find((s) => s.id === mostRecent.storyId);
    if (!sample) return null;

    return { sample, progress: mostRecent };
  }, [progressMap, allSamples]);

  // Reading stats for users with history
  const readingStats = useMemo(() => {
    const allProgress = Object.values(progressMap);
    if (allProgress.length === 0) return null;

    const completed = allProgress.filter((p) => p.isCompleted).length;
    const inProgress = allProgress.filter((p) => !p.isCompleted && p.scrollPercent > 0).length;

    return { completed, inProgress };
  }, [progressMap]);

  return (
    <div className="min-h-screen pb-24 sm:pb-6">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 text-center">
        <h1 className="text-2xl font-bold">Reader</h1>
        <p className="text-sm text-muted-foreground mt-1">Read real Macedonian — tap any word.</p>
      </header>

      <PageContainer size="lg">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="library" data-testid="reader-tab-library">
              <Library className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="workspace" data-testid="reader-tab-workspace">
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

            {/* Continue Reading Card */}
            {continueReadingStory && (
              <Link
                href={`/${locale}/reader/samples/${continueReadingStory.sample.id}`}
                data-testid="reader-continue-reading-cta"
                className={cn(
                  'flex items-center gap-4 rounded-2xl p-4',
                  'bg-gradient-to-r from-primary/20 to-emerald-500/20',
                  'border border-primary/30 hover:border-primary/50',
                  'transition-all hover:shadow-lg'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {locale === 'mk'
                      ? continueReadingStory.sample.title_mk
                      : continueReadingStory.sample.title_en}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(continueReadingStory.progress.scrollPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(continueReadingStory.progress.scrollPercent)}%
                    </span>
                  </div>
                </div>
                <Button size="sm" className="rounded-full shrink-0" data-testid="reader-continue-reading-btn">
                  Continue
                </Button>
              </Link>
            )}

            {/* Reading Stats Summary */}
            {readingStats && (readingStats.completed > 0 || readingStats.inProgress > 0) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground px-1">
                {readingStats.completed > 0 && (
                  <span>{readingStats.completed} {readingStats.completed === 1 ? 'story' : 'stories'} read</span>
                )}
                {readingStats.inProgress > 0 && (
                  <span>{readingStats.inProgress} in progress</span>
                )}
              </div>
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 text-muted-foreground hover:text-foreground"
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
                        'rounded-full min-h-[48px] px-4 text-sm font-semibold transition-all',
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
                      className="rounded-full min-h-[48px] px-4 text-sm font-medium text-muted-foreground"
                      data-testid="reader-filter-clear-all"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}

              {/* Topic Filter Chips and Sort Dropdown */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Topic Chips */}
                {availableTopics.length > 1 && availableTopics.map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                    aria-pressed={selectedTopic === topic}
                    data-active={selectedTopic === topic ? 'true' : 'false'}
                    className={cn(
                      'rounded-full min-h-[48px] px-4 text-sm font-medium transition-all',
                      selectedTopic === topic
                        ? 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800'
                        : 'bg-transparent hover:border-slate-400'
                    )}
                    data-testid={`reader-filter-topic-${topic.toLowerCase().replace(' ', '-')}`}
                  >
                    {topic}
                  </Button>
                ))}

                {/* Sort Dropdown */}
                <div className="ml-auto flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger
                      className="min-h-[48px] min-w-[160px] rounded-full"
                      data-testid="reader-sort-trigger"
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default" data-testid="reader-sort-default">Default</SelectItem>
                      <SelectItem value="difficulty" data-testid="reader-sort-difficulty">Difficulty</SelectItem>
                      <SelectItem value="duration" data-testid="reader-sort-duration">Reading Time</SelectItem>
                      <SelectItem value="progress" data-testid="reader-sort-progress">My Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
                    {filteredSamples.map((sample, index) => {
                      const isPremium = isPremiumSample(sample);
                      const isLocked = paywallEnabled && isPremium && !isPro;
                      const { isCompleted, progressPercent } = getProgressForSample(sample.id);
                      const animationDelay = Math.min(100 + index * 50, 500);

                      return (
                        <div
                          key={sample.id}
                          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                          style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
                        >
                          <ReadingSampleCard
                            sample={sample}
                            locale={locale}
                            isPremium={isPremium}
                            isLocked={isLocked}
                            isCompleted={isCompleted}
                            progressPercent={progressPercent}
                            ctaHref={
                              isLocked ? `/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/reader`)}` : undefined
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p className="mb-2">No readings match your filters.</p>

                    {/* Contextual suggestions */}
                    {selectedTopic && selectedDifficulty && (
                      <p className="text-sm mb-4">
                        Try a different topic or difficulty level.
                      </p>
                    )}
                    {selectedTopic && !selectedDifficulty && (
                      <p className="text-sm mb-4">
                        Try a different topic or clear filters to see all stories.
                      </p>
                    )}
                    {selectedDifficulty && !selectedTopic && (
                      <p className="text-sm mb-4">
                        {selectedDifficulty === 'A1' && 'Try A2 level for slightly more challenge.'}
                        {selectedDifficulty === 'A2' && 'Try A1 for easier or B1 for more challenge.'}
                        {selectedDifficulty === 'B1' && 'Try A2 for easier content.'}
                        {selectedDifficulty === 'B2' && 'Try B1 for slightly easier content.'}
                      </p>
                    )}

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {selectedTopic && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTopic(null)}
                          className="rounded-full"
                          data-testid="reader-clear-topic-filter"
                        >
                          Clear topic
                        </Button>
                      )}
                      {selectedDifficulty && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDifficulty(null)}
                          className="rounded-full"
                          data-testid="reader-clear-difficulty-filter"
                        >
                          Clear difficulty
                        </Button>
                      )}
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        data-testid="reader-filter-clear-empty"
                      >
                        Clear all filters
                      </Button>
                    </div>
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
                    <h2 className="text-lg font-semibold">
                      {t('sections.readingChallenges', { default: 'Reading Challenges' })}
                    </h2>
                    <Link
                      href={`/${locale}/learn?level=challenge`}
                      className="text-sm text-primary hover:underline"
                      data-testid="reader-challenges-view-all"
                    >
                      {viewAllChaptersLabel}
                    </Link>
                  </div>

                  {/* 30-Day Challenge Featured */}
                  <div
                    className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-3"
                    data-testid="reader-30day-section"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">30-Day Reading Challenge</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">NEW</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Read &ldquo;The Little Prince&rdquo; in Macedonian, one chapter at a time.
                    </p>
                    <Button
                      asChild
                      className="min-h-[48px] rounded-full px-4 text-black"
                      data-testid="reader-30day-start"
                    >
                      <Link href={`/${locale}/reader/samples/day01-maliot-princ`}>
                        {t('sections.startDay1', { default: 'Start Day 1' })}
                      </Link>
                    </Button>
                  </div>

                  {/* Preview of challenge content */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {challengeSamples.slice(0, 4).map((sample, index) => {
                      const isPremium = isPremiumSample(sample);
                      const isLocked = paywallEnabled && isPremium && !isPro;
                      const { isCompleted, progressPercent } = getProgressForSample(sample.id);
                      const animationDelay = Math.min(100 + index * 50, 500);

                      return (
                        <div
                          key={sample.id}
                          className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                          style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
                        >
                          <ReadingSampleCard
                            sample={sample}
                            locale={locale}
                            isPremium={isPremium}
                            isLocked={isLocked}
                            isCompleted={isCompleted}
                            progressPercent={progressPercent}
                            ctaHref={
                              isLocked ? `/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/reader`)}` : undefined
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* All Readings */}
                <section className="space-y-2" data-testid="reader-all-readings">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {t('sections.allReadings', { default: 'All Readings' })}
                    </h2>
                    <span className="text-sm text-muted-foreground">{allReadingsCountLabel}</span>
                  </div>
                </section>

                {/* Conversations Section */}
                <section className="space-y-4" data-testid="reader-conversations-section">
                  <h2 className="text-lg font-semibold">Conversations</h2>
                  {conversationSamples.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {conversationSamples.map((sample, index) => {
                        const { isCompleted, progressPercent } = getProgressForSample(sample.id);
                        const animationDelay = Math.min(100 + index * 50, 500);
                        return (
                          <div
                            key={sample.id}
                            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                            style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
                          >
                            <ReadingSampleCard
                              sample={sample}
                              locale={locale}
                              isPremium={false}
                              isLocked={false}
                              isCompleted={isCompleted}
                              progressPercent={progressPercent}
                            />
                          </div>
                        );
                      })}
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
                      {storySamples.map((sample, index) => {
                        const { isCompleted, progressPercent } = getProgressForSample(sample.id);
                        const animationDelay = Math.min(100 + index * 50, 500);
                        return (
                          <div
                            key={sample.id}
                            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                            style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'backwards' }}
                          >
                            <ReadingSampleCard
                              sample={sample}
                              locale={locale}
                              isPremium={false}
                              isLocked={false}
                              isCompleted={isCompleted}
                              progressPercent={progressPercent}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">More stories coming soon</p>
                  )}
                </section>

                {/* Continue Learning Link */}
                <div className="text-center pt-6 pb-2">
                  <Link
                    href={`/${locale}/learn`}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid="reader-library-continue-learning"
                  >
                    {t('library.continueLearning', { default: 'Continue your lessons' })}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
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

            {/* Practice saved words CTA */}
            {savedCount > 0 && (
              <Link
                href={`/${locale}/practice/session?deck=saved`}
                data-testid="reader-workspace-practice-saved"
                className={cn(
                  'flex items-center gap-4 rounded-2xl p-4',
                  'bg-gradient-to-r from-primary/10 to-emerald-500/10',
                  'border border-primary/30 hover:border-primary/50',
                  'transition-all hover:shadow-lg'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{t('workspace.practiceReady', { default: 'Ready to practice?' })}</p>
                  <p className="text-sm text-muted-foreground">{t('workspace.savedWordsCount', { count: savedCount, default: `${savedCount} saved words` })}</p>
                </div>
                <Button size="sm" className="rounded-full" data-testid="reader-workspace-practice-btn">
                  {t('workspace.practiceNow', { default: 'Practice Now' })}
                </Button>
              </Link>
            )}

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
