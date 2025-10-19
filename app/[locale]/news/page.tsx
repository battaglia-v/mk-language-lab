'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ExternalLink, Loader2, Newspaper, PlayCircle, RefreshCcw, Video } from 'lucide-react';

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

function getVideoThumbnailUrl(videoUrl: string): string | null {
  try {
    const parsed = new URL(videoUrl);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }

    if (host === 'youtu.be') {
      const slug = parsed.pathname.replace(/^\//, '');
      const id = slug.split('/')[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function resolvePreviewAsset(item: NewsItem): { url: string | null; fromVideo: boolean } {
  if (item.image) {
    return { url: item.image, fromVideo: false };
  }

  const primaryVideo = item.videos[0];
  if (!primaryVideo) {
    return { url: null, fromVideo: false };
  }

  const thumbnail = getVideoThumbnailUrl(primaryVideo);
  return { url: thumbnail, fromVideo: Boolean(thumbnail) };
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
          cache: 'no-store',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12 space-y-10">
        <header className="max-w-3xl space-y-4">
          <Badge variant="secondary" className="w-fit gap-1">
            <Newspaper className="h-4 w-4" />
            {t('sourceLabel')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </header>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-wrap gap-3">
              {sourceFilters.map((filter) => {
                const isActive = source === filter.id;
                return (
                  <Button
                    key={filter.id}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSource(filter.id)}
                  >
                    {filter.label}
                  </Button>
                );
              })}
              <Button
                variant={videosOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVideosOnly((prev) => !prev)}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                {t('videosOnly')}
              </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="h-11"
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('refresh')}
                  </span>
                ) : (
                  <span>{lastUpdatedLabel}</span>
                )}
                <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  {t('refresh')}
                </Button>
              </div>
            </div>

            {error && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardHeader>
                  <CardTitle className="text-destructive">{t('error')}</CardTitle>
                  <CardDescription className="text-destructive">
                    {error}
                  </CardDescription>
                  <Button variant="destructive" size="sm" className="mt-4 w-fit" onClick={handleRefresh}>
                    {t('retry')}
                  </Button>
                </CardHeader>
              </Card>
            )}

            {!error && meta?.errors && meta.errors.length > 0 && (
              <Card className="border-border/40 bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-muted-foreground">{t('error')}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {meta.errors.join(' • ')}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </CardContent>
        </Card>

        {!hasResults && !isLoading && !error && (
          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardContent className="py-16 text-center text-muted-foreground text-lg">
              {t('noResults')}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {items.map((item) => {
            const publishedLabel = item.publishedAt ? t('published', { relative: formatRelativeTime(item.publishedAt) }) : '';
            const hasVideos = item.videos.length > 0;
            const { url: previewImage, fromVideo } = resolvePreviewAsset(item);

            return (
              <Card key={item.id} className="border-border/50 bg-card/70 backdrop-blur">
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <CardTitle className="text-2xl leading-tight">
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {item.title}
                          </a>
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{item.sourceName}</span>
                          {publishedLabel ? ` · ${publishedLabel}` : ''}
                        </CardDescription>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.categories.slice(0, 4).map((category) => (
                          <Badge key={`${item.id}-${category}`} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {hasVideos && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <PlayCircle className="h-3.5 w-3.5" />
                            {item.videos.length}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 md:pt-3">
                        <Button asChild size="sm" className="gap-2">
                          <Link href={item.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            {t('viewArticle')}
                          </Link>
                        </Button>
                        {hasVideos && (
                          <Button asChild size="sm" variant="outline" className="gap-2">
                            <Link href={item.videos[0]} target="_blank" rel="noopener noreferrer">
                              <PlayCircle className="h-4 w-4" />
                              {t('watchVideo')}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>

                    {previewImage && (
                      <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl border border-border/30 bg-muted/30 shadow-sm md:mt-0 md:ml-6 md:w-64 lg:w-72">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewImage}
                          alt={`Preview for ${item.title}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        {fromVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <PlayCircle className="h-10 w-10 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>
            Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
