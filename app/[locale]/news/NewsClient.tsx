'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProxiedNewsImage } from '@/components/news/ProxiedNewsImage';
import { ExternalLink, Loader2, Newspaper, PlayCircle, RefreshCcw, Search, Video, Clock3 } from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const SOURCE_IDS = ['all', 'time-mk', 'meta-mk', 'makfax', 'a1on'] as const;

type SourceId = (typeof SOURCE_IDS)[number];

type NewsItem = {
  id: string;
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  categories: string[];
  videos: string[];
  image: string | null;
  imageProxy?: string | null;
};

type NewsMeta = {
  count: number;
  total: number;
  fetchedAt: string;
  errors?: string[];
};

type NewsResponse = {
  items: NewsItem[];
  meta: NewsMeta;
};

const SKELETON_PLACEHOLDERS = Array.from({ length: 6 }, (_, index) => index);

function NewsSkeletonCard() {
  return (
    <Card className="glass-card overflow-hidden border border-border/60">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader className="space-y-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

function NewsFeaturedSkeleton() {
  return (
    <Card className="glass-card overflow-hidden border border-border/60">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </Card>
  );
}

function NewsCompactSkeleton() {
  return (
    <Card className="glass-card overflow-hidden border border-border/60 sm:flex">
      <Skeleton className="aspect-[16/9] w-full rounded-none sm:aspect-[4/3] sm:w-48" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </Card>
  );
}

function buildNewsApiUrl(base: string, params: URLSearchParams): string {
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}${params.toString()}`;
}

function normalizeSource(value: string | null | undefined): SourceId {
  const candidate = (value ?? 'all').toLowerCase();
  return SOURCE_IDS.includes(candidate as SourceId) ? (candidate as SourceId) : 'all';
}

export default function NewsClient({
  initialItems,
  initialMeta,
  initialSource,
  initialQuery,
  initialVideosOnly,
}: {
  initialItems: NewsItem[];
  initialMeta: NewsMeta | null;
  initialSource: SourceId;
  initialQuery: string;
  initialVideosOnly: boolean;
}) {
  const t = useTranslations('news');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [source, setSource] = useState<SourceId>(initialSource);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [videosOnly, setVideosOnly] = useState(initialVideosOnly);
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [meta, setMeta] = useState<NewsMeta | null>(initialMeta);
  const [isLoading, setIsLoading] = useState(initialMeta ? false : true);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetchRef = useRef(Boolean(initialMeta));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state from URL (supports browser back/forward).
  useEffect(() => {
    const nextSource = normalizeSource(searchParams.get('source'));
    const nextQuery = searchParams.get('q') ?? '';
    const nextVideosOnly = searchParams.get('videosOnly') === 'true';

    setSource(nextSource);
    setQuery(nextQuery);
    setDebouncedQuery(nextQuery);
    setVideosOnly(nextVideosOnly);
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const sourceFilters = useMemo(
    () => [
      { id: 'all' as SourceId, label: t('sourceAll') },
      { id: 'time-mk' as SourceId, label: 'Time.mk' },
      { id: 'meta-mk' as SourceId, label: 'Meta.mk' },
      { id: 'makfax' as SourceId, label: 'Makfax' },
      { id: 'a1on' as SourceId, label: 'A1on' },
    ],
    [t]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (source !== 'all') {
      params.set('source', source);
    }
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (videosOnly) {
      params.set('videosOnly', 'true');
    }

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [pathname, query, router, source, videosOnly]);

  const formatRelativeTime = useCallback(
    (isoDate: string) => {
      const parsed = new Date(isoDate);
      if (Number.isNaN(parsed.getTime())) {
        return '';
      }

      const diffMilliseconds = parsed.getTime() - Date.now();
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const divisions: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
        { amount: 60, unit: 'second' },
        { amount: 60, unit: 'minute' },
        { amount: 24, unit: 'hour' },
        { amount: 7, unit: 'day' },
        { amount: 4.34524, unit: 'week' },
        { amount: 12, unit: 'month' },
        { amount: Number.POSITIVE_INFINITY, unit: 'year' },
      ];

      let duration = diffMilliseconds / 1000;

      for (const division of divisions) {
        if (Math.abs(duration) < division.amount) {
          return rtf.format(Math.round(duration), division.unit);
        }
        duration /= division.amount;
      }

      return parsed.toLocaleString(locale);
    },
    [locale]
  );

  const fetchNews = useCallback(
    async (options?: { signal?: AbortSignal }) => {
      const params = new URLSearchParams({ limit: '30', source });
      if (debouncedQuery.trim()) {
        params.set('q', debouncedQuery.trim());
      }
      if (videosOnly) {
        params.set('videosOnly', 'true');
      }

      try {
        setIsLoading(true);
        setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_NEWS_API_URL ?? '/api/news';
        const response = await fetch(buildNewsApiUrl(baseUrl, params), {
          signal: options?.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as NewsResponse;
        setItems(data.items);
        setMeta({ ...data.meta });
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError((err as Error).message ?? t('error'));
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedQuery, source, t, videosOnly]
  );

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

    const controller = new AbortController();
    void fetchNews({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchNews]);

  const handleRefresh = () => {
    const controller = new AbortController();
    void fetchNews({ signal: controller.signal });
  };

  const handleClearFilters = () => {
    setSource('all');
    setQuery('');
    setVideosOnly(false);
    trackEvent(AnalyticsEvents.NEWS_FILTER_CHANGED, { filterType: 'reset', value: 'all' });
  };

  const lastUpdatedLabel = mounted && meta?.fetchedAt
    ? t('lastUpdated', {
        time: new Date(meta.fetchedAt).toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    : '';

  const hasResults = items.length > 0;
  const showSkeleton = isLoading && items.length === 0;
  const showEmpty = !hasResults && !isLoading && !error;
  const useEditorialLayout = items.length >= 4;
  const leadItem = useEditorialLayout ? items[0] : undefined;
  const secondaryItems = useEditorialLayout ? items.slice(1, 3) : [];
  const gridItems = useEditorialLayout ? items.slice(3) : items;
  const resultsLabel = meta ? t('resultsLabel', { count: meta.count, total: meta.total }) : '';

  return (
    <div className="space-y-4 px-4 sm:space-y-6 sm:px-5 md:px-6">
      <section className="lab-hero" data-testid="news-hero">
        <div className="flex flex-col gap-3 sm:gap-4">
          <header className="page-header">
            <div className="page-header-content">
              <p className="page-header-badge">
                <Newspaper className="inline h-3 w-3 mr-1.5" aria-hidden="true" />
                {t('title')}
              </p>
              <h1 className="page-header-title text-balance break-words">{t('title')}</h1>
              <p className="page-header-subtitle text-balance break-words">{t('subtitle')}</p>
              <p className="text-xs text-muted-foreground">
                {t('sourceLabel')} · {meta ? `${meta.count}/${meta.total}` : '—'}
              </p>
            </div>
          </header>
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5 sm:rounded-3xl sm:p-7 md:p-8" data-testid="news-filters">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {sourceFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                active={source === filter.id}
                className="min-h-[34px]"
                data-testid={`news-filter-source-${filter.id}`}
                onClick={() => {
                  setSource(filter.id);
                  trackEvent(AnalyticsEvents.NEWS_FILTER_CHANGED, { filterType: 'source', value: filter.id });
                }}
              >
                {filter.label}
              </FilterChip>
            ))}
            <FilterChip
              active={videosOnly}
              className="min-h-[34px]"
              data-testid="news-filter-videos-only"
              onClick={() => {
                setVideosOnly((prev) => {
                  trackEvent(AnalyticsEvents.NEWS_FILTER_CHANGED, { filterType: 'videosOnly', value: !prev });
                  return !prev;
                });
              }}
            >
              <Video className="h-3.5 w-3.5" />
              {t('videosOnly')}
            </FilterChip>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="min-h-[48px] rounded-2xl border border-border/60 bg-background/80 pl-10 text-sm text-foreground placeholder:text-muted-foreground"
                data-testid="news-search-input"
              />
            </div>
            <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t('refresh')}
                </span>
              ) : (
                lastUpdatedLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {lastUpdatedLabel}
                  </span>
                )
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                data-testid="news-refresh"
                className="min-h-[48px] w-full gap-1.5 rounded-full border border-border/60 px-4 text-foreground sm:w-auto"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                {t('refresh')}
              </Button>
            </div>
          </div>
          {resultsLabel && (
            <div className="text-xs text-muted-foreground break-words">
              {resultsLabel}
            </div>
          )}
        </div>
      </section>

      {error && (
        <Alert variant="destructive" className="glass-card border border-destructive/50 text-red-100">
          <AlertTitle className="text-sm sm:text-base">{t('error')}</AlertTitle>
          <AlertDescription className="text-xs text-red-100/90 break-words sm:text-sm">{error}</AlertDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 min-h-[48px] rounded-full border-border/60 px-4 text-sm text-white sm:mt-4"
            onClick={handleRefresh}
            data-testid="news-retry"
          >
            {t('retry')}
          </Button>
        </Alert>
      )}

      {!error && meta?.errors && meta.errors.length > 0 && (
        <Alert className="glass-card border border-border/60 text-foreground">
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription className="text-muted-foreground break-words">{meta.errors.join(' • ')}</AlertDescription>
        </Alert>
      )}

      {showSkeleton && (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <NewsFeaturedSkeleton />
            <div className="grid gap-4">
              <NewsCompactSkeleton />
              <NewsCompactSkeleton />
            </div>
          </section>
          <div className="card-grid three" data-testid="news-grid">
            {SKELETON_PLACEHOLDERS.map((index) => (
              <NewsSkeletonCard key={`news-skeleton-${index}`} />
            ))}
          </div>
        </div>
      )}

      {showEmpty && (
        <Card className="glass-card border border-border/60">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">{t('emptyTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('emptyBody')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="min-h-[48px] rounded-full px-5"
              data-testid="news-clear-filters"
            >
              {t('clearFilters')}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasResults && !showSkeleton && (
        <div className="space-y-6">
          {leadItem && (
            <section className={secondaryItems.length > 0 ? "grid gap-4 lg:grid-cols-[1.4fr_1fr]" : "grid gap-4"}>
              <a
                href={leadItem.link}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`news-article-${leadItem.id}`}
                onClick={() => {
                  trackEvent(AnalyticsEvents.NEWS_ARTICLE_CLICKED, {
                    source: leadItem.sourceId,
                    hasCategories: leadItem.categories.length > 0,
                  });
                }}
                className="group h-full"
              >
                <Card className="glass-card relative flex h-full flex-col overflow-hidden border border-border/60 bg-background/40 shadow-[0_24px_60px_rgba(0,0,0,0.25)] transition-all hover:border-primary/40">
                  <div className="relative">
                    <ProxiedNewsImage
                      imageUrl={leadItem.image}
                      alt={leadItem.title}
                      sourceId={leadItem.sourceId}
                      sourceName={leadItem.sourceName}
                      containerClassName="aspect-[16/9]"
                      className="transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <Badge variant="secondary" className="bg-black/45 text-[11px] text-white backdrop-blur">
                          {leadItem.sourceName}
                        </Badge>
                        {leadItem.categories.slice(0, 2).map((category) => (
                          <Badge
                            key={`${leadItem.id}-${category}`}
                            variant="secondary"
                            className="max-w-[140px] truncate bg-white/10 text-[11px] text-white sm:max-w-none"
                            title={category}
                          >
                            {category}
                          </Badge>
                        ))}
                        {leadItem.categories.length > 2 && (
                          <Badge variant="secondary" className="bg-white/10 text-[11px] text-white">
                            +{leadItem.categories.length - 2}
                          </Badge>
                        )}
                        {leadItem.videos.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="inline-flex items-center gap-1 bg-primary/25 text-[11px] text-white"
                          >
                            <PlayCircle className="h-3 w-3" />
                            {leadItem.videos.length}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 min-w-0">
                        <h2 className="text-lg font-semibold leading-snug text-white line-clamp-2 break-words sm:text-xl">
                          {leadItem.title}
                        </h2>
                        {leadItem.description && (
                          <p className="text-sm text-white/80 line-clamp-2 break-words">
                            {leadItem.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
                        {mounted && leadItem.publishedAt && (
                          <span suppressHydrationWarning className="inline-flex items-center gap-1.5 min-w-0">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatRelativeTime(leadItem.publishedAt)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                          {leadItem.videos.length > 0 ? t('watchVideo') : t('viewArticle')}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </a>
              {secondaryItems.length > 0 && (
                <div className="grid gap-4">
                  {secondaryItems.map((item) => {
                    const publishedLabel = mounted && item.publishedAt ? formatRelativeTime(item.publishedAt) : '';
                    const hasVideos = item.videos.length > 0;
                    const ctaLabel = hasVideos ? t('watchVideo') : t('viewArticle');
                    return (
                      <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`news-article-${item.id}`}
                        onClick={() => {
                          trackEvent(AnalyticsEvents.NEWS_ARTICLE_CLICKED, {
                            source: item.sourceId,
                            hasCategories: item.categories.length > 0,
                          });
                        }}
                        className="group h-full"
                      >
                        <Card className="glass-card flex h-full flex-col overflow-hidden border border-border/60 bg-background/40 transition-all hover:border-primary/40 hover:shadow-xl sm:flex-row">
                          <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[4/3] sm:w-48">
                            <ProxiedNewsImage
                              imageUrl={item.image}
                              alt={item.title}
                              sourceId={item.sourceId}
                              sourceName={item.sourceName}
                              containerClassName="aspect-[16/9] sm:aspect-[4/3]"
                              className="transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-3 p-4 min-w-0">
                            <Badge variant="secondary" className="w-fit bg-primary/15 text-[11px] text-primary">
                              {item.sourceName}
                            </Badge>
                            <div className="space-y-2 min-w-0">
                              <h3 className="text-base font-semibold text-foreground line-clamp-2 break-words group-hover:text-primary">
                                {item.title}
                              </h3>
                              {item.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="mt-auto flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                              {publishedLabel && (
                                <span suppressHydrationWarning className="inline-flex items-center gap-1.5 min-w-0">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  {publishedLabel}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                                {ctaLabel}
                                <ExternalLink className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                        </Card>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {gridItems.length > 0 && (
            <section className="space-y-4">
              {useEditorialLayout && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t('latestTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('latestSubtitle')}</p>
                  </div>
                  {resultsLabel && (
                    <span className="text-xs text-muted-foreground">{resultsLabel}</span>
                  )}
                </div>
              )}
              <div className="card-grid three" data-testid="news-grid">
                {gridItems.map((item) => {
                  const publishedLabel = mounted && item.publishedAt ? formatRelativeTime(item.publishedAt) : '';
                  const hasVideos = item.videos.length > 0;
                  const ctaLabel = hasVideos ? t('watchVideo') : t('viewArticle');
                  const visibleCategories = item.categories.slice(0, 3);
                  const extraCategoryCount = item.categories.length - visibleCategories.length;

                  return (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`news-article-${item.id}`}
                      onClick={() => {
                        trackEvent(AnalyticsEvents.NEWS_ARTICLE_CLICKED, {
                          source: item.sourceId,
                          hasCategories: item.categories.length > 0,
                        });
                      }}
                      className="group h-full"
                    >
                      <Card
                        className="glass-card flex h-full flex-col overflow-hidden border border-border/60 bg-background/40 transition-shadow hover:border-primary/40 hover:shadow-2xl"
                        data-testid="news-card"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          <ProxiedNewsImage
                            imageUrl={item.image}
                            alt={item.title}
                            sourceId={item.sourceId}
                            sourceName={item.sourceName}
                            containerClassName="aspect-[16/10]"
                            className="transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                          <Badge variant="secondary" className="absolute left-4 bottom-3 text-[11px] bg-black/50 text-white backdrop-blur">
                            {item.sourceName}
                          </Badge>
                        </div>
                        <CardHeader className="flex-1 space-y-3 min-w-0">
                          <CardTitle className="text-base font-semibold leading-snug text-foreground line-clamp-2 break-words group-hover:text-primary">
                            {item.title}
                          </CardTitle>
                          {item.description && (
                            <CardDescription className="line-clamp-3 text-sm text-muted-foreground break-words">
                              {item.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3 min-w-0">
                          <div className="flex flex-wrap gap-1.5">
                            {visibleCategories.map((category) => (
                              <Badge
                                key={`${item.id}-${category}`}
                                variant="outline"
                                className="max-w-[140px] truncate rounded-full border-border/60 px-2 text-[11px] text-foreground sm:max-w-none"
                                title={category}
                              >
                                {category}
                              </Badge>
                            ))}
                            {extraCategoryCount > 0 && (
                              <Badge
                                variant="outline"
                                className="rounded-full border-border/60 px-2 text-[11px] text-foreground"
                              >
                                +{extraCategoryCount}
                              </Badge>
                            )}
                            {hasVideos && (
                              <Badge
                                variant="secondary"
                                className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 text-[11px] text-white"
                              >
                                <PlayCircle className="h-3 w-3" />
                                {item.videos.length}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            {publishedLabel && (
                              <span suppressHydrationWarning className="inline-flex items-center gap-1.5 min-w-0">
                                <Clock3 className="h-3.5 w-3.5" />
                                {publishedLabel}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                              {ctaLabel}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
