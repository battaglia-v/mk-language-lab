'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Loader2, Newspaper, PlayCircle, RefreshCcw, Search, Video, Clock3 } from 'lucide-react';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

const SOURCE_IDS = ['all', 'time-mk', 'meta-mk'] as const;

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
    <Card className="glass-card overflow-hidden border border-white/10">
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

export default function NewsPage() {
  const t = useTranslations('news');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSourceParam = (searchParams.get('source') ?? 'all').toLowerCase();
  const initialQueryParam = searchParams.get('q') ?? '';
  const initialVideosOnly = searchParams.get('videosOnly') === 'true';

  const initialSource: SourceId = SOURCE_IDS.includes(initialSourceParam as SourceId)
    ? (initialSourceParam as SourceId)
    : 'all';

  const [source, setSource] = useState<SourceId>(initialSource);
  const [query, setQuery] = useState(initialQueryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQueryParam);
  const [videosOnly, setVideosOnly] = useState(initialVideosOnly);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [meta, setMeta] = useState<NewsMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSource(initialSource);
  }, [initialSource]);

  useEffect(() => {
    setQuery(initialQueryParam);
    setDebouncedQuery(initialQueryParam);
  }, [initialQueryParam]);

  useEffect(() => {
    setVideosOnly(initialVideosOnly);
  }, [initialVideosOnly]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const sourceFilters = useMemo(
    () => [
      { id: 'all' as SourceId, label: t('sourceAll') },
      { id: 'time-mk' as SourceId, label: t('sourceTime') },
      { id: 'meta-mk' as SourceId, label: t('sourceMeta') },
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
        const response = await fetch(`/api/news?${params.toString()}`, {
          next: { revalidate: 180 }, // Cache for 3 minutes, matching API route
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
    const controller = new AbortController();
    void fetchNews({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchNews]);

  const handleRefresh = () => {
    const controller = new AbortController();
    void fetchNews({ signal: controller.signal });
  };

  const lastUpdatedLabel = meta?.fetchedAt
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

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section className="glass-card rounded-3xl p-6 md:p-8" data-testid="news-hero">
          <div className="flex flex-col gap-6">
            <header className="space-y-2">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary"
                aria-hidden="true"
              >
                <Newspaper className="h-4 w-4" aria-hidden="true" />
                {t('title')}
              </div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
              <p className="text-sm text-slate-300">{t('subtitle')}</p>
              <p className="text-sm text-slate-300">
                {t('sourceLabel')} · {meta?.count ?? 0}/{meta?.total ?? 0}
              </p>
            </header>

            <div className="space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {sourceFilters.map((filter) => (
                  <FilterChip key={filter.id} active={source === filter.id} onClick={() => setSource(filter.id)}>
                    {filter.label}
                  </FilterChip>
                ))}
                <FilterChip active={videosOnly} onClick={() => setVideosOnly((prev) => !prev)}>
                  <Video className="h-3.5 w-3.5" />
                  {t('videosOnly')}
                </FilterChip>
              </div>
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="h-11 rounded-2xl border border-white/10 bg-background/80 pl-10 text-sm text-white placeholder:text-slate-400"
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
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
                  className="gap-1.5 rounded-full border border-white/10 text-white hover:bg-white/10"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {t('refresh')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <Alert variant="destructive" className="glass-card border border-destructive/50 text-red-100">
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription className="text-red-100/90">{error}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full border-white/20 text-white hover:bg-white/10"
              onClick={handleRefresh}
            >
              {t('retry')}
            </Button>
          </Alert>
        )}

        {!error && meta?.errors && meta.errors.length > 0 && (
          <Alert className="glass-card border border-white/20 text-slate-200">
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription className="text-slate-300">{meta.errors.join(' • ')}</AlertDescription>
          </Alert>
        )}

        {showSkeleton && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="news-grid">
            {SKELETON_PLACEHOLDERS.map((index) => (
              <NewsSkeletonCard key={`news-skeleton-${index}`} />
            ))}
          </div>
        )}

        {showEmpty && (
          <Card className="glass-card border border-white/10">
            <CardContent className="py-10 text-center text-sm text-slate-300">{t('noResults')}</CardContent>
          </Card>
        )}

        {hasResults && !showSkeleton && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="news-grid">
            {items.map((item) => {
              const publishedLabel = item.publishedAt ? formatRelativeTime(item.publishedAt) : '';
              const hasVideos = item.videos.length > 0;

              return (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackEvent(AnalyticsEvents.NEWS_ARTICLE_CLICKED, {
                      source: item.sourceId,
                      hasCategories: item.categories.length > 0,
                    });
                  }}
                  className="group h-full"
                >
                  <Card
                    className="glass-card flex h-full flex-col overflow-hidden border border-white/5 bg-transparent transition-shadow hover:border-primary/40 hover:shadow-2xl"
                    data-testid="news-card"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      {item.image ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.image})` }}
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted via-muted/80 to-muted">
                          <Newspaper className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                      <Badge variant="secondary" className="absolute left-4 bottom-3 text-[11px] bg-black/50 text-white backdrop-blur">
                        {item.sourceName}
                      </Badge>
                    </div>
                    <CardHeader className="flex-1 space-y-3">
                      <CardTitle className="text-base font-semibold leading-snug text-white line-clamp-2 group-hover:text-primary">
                        {item.title}
                      </CardTitle>
                      {item.description && (
                        <CardDescription className="line-clamp-3 text-sm text-slate-300">
                          {item.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {item.categories.slice(0, 3).map((category) => (
                          <Badge
                            key={`${item.id}-${category}`}
                            variant="outline"
                            className="rounded-full border-white/20 px-2 text-[11px] text-slate-200"
                          >
                            {category}
                          </Badge>
                        ))}
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
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        {publishedLabel && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {publishedLabel}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          {hasVideos ? t('watchVideo') : t('viewArticle')}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
