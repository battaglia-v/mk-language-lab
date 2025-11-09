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

function getSourceInitials(name: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials.slice(0, 2) || 'MK';
}

function SkeletonCard() {
  return (
    <Card className="border-border/30 bg-card/40 overflow-hidden">
      <CardHeader>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Content skeleton */}
          <div className="flex-1 space-y-3">
            {/* Source badge */}
            <div className="relative h-5 w-20 rounded-full overflow-hidden bg-muted/40">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent animate-pulse"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>

            {/* Title skeleton - 2 lines */}
            <div className="space-y-2">
              <div className="relative h-6 w-full rounded overflow-hidden bg-muted/50">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite 0.1s'
                  }}
                />
              </div>
              <div className="relative h-6 w-4/5 rounded overflow-hidden bg-muted/50">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite 0.2s'
                  }}
                />
              </div>
            </div>

            {/* Meta info */}
            <div className="relative h-4 w-48 rounded overflow-hidden bg-muted/40">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite 0.3s'
                }}
              />
            </div>

            {/* Description - 3 lines */}
            <div className="space-y-2">
              <div className="relative h-4 w-full rounded overflow-hidden bg-muted/30">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/15 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite 0.4s'
                  }}
                />
              </div>
              <div className="relative h-4 w-full rounded overflow-hidden bg-muted/30">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/15 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite 0.5s'
                  }}
                />
              </div>
              <div className="relative h-4 w-3/4 rounded overflow-hidden bg-muted/30">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/15 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite 0.6s'
                  }}
                />
              </div>
            </div>

            {/* Category badges */}
            <div className="flex gap-2">
              <div className="relative h-6 w-16 rounded-full overflow-hidden bg-muted/30">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/15 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite 0.7s'
                  }}
                />
              </div>
              <div className="relative h-6 w-20 rounded-full overflow-hidden bg-muted/30">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/15 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite 0.8s'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Image skeleton */}
          <div className="relative w-full md:w-64 lg:w-72 aspect-video rounded-xl overflow-hidden border border-border/20 bg-muted/30">
            <div
              className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/20"
              style={{
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s infinite 0.9s'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
          </div>
        </div>
      </CardHeader>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </Card>
  );
}

function buildImageCandidates(imageUrl: string | null): string[] {
  if (!imageUrl) {
    return [];
  }

  const candidates: string[] = [];

  // Try HTTPS first for security
  if (/^http:\/\//i.test(imageUrl)) {
    const httpsVariant = imageUrl.replace(/^http:\/\//i, 'https://');
    candidates.push(httpsVariant);
    candidates.push(imageUrl); // Fallback to HTTP if HTTPS fails
  } else {
    candidates.push(imageUrl);
  }

  // Handle protocol-relative URLs
  if (imageUrl.startsWith('//')) {
    candidates.unshift(`https:${imageUrl}`);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

type NewsPreviewMediaProps = {
  imageUrl: string | null;
  sourceInitials: string;
  sourceName: string;
  alt: string;
  showVideoOverlay: boolean;
};

function NewsPreviewMedia({ imageUrl, sourceInitials, sourceName, alt, showVideoOverlay }: NewsPreviewMediaProps) {
  const candidates = useMemo(() => buildImageCandidates(imageUrl), [imageUrl]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setAllFailed(false);
    setIsLoading(true);
    setImageSize(null);
  }, [candidates.length, imageUrl]);

  const currentUrl = candidates[activeIndex] ?? null;
  const hasImage = Boolean(currentUrl) && !allFailed;

  const handleImageError = useCallback(() => {
    if (activeIndex + 1 < candidates.length) {
      setActiveIndex((index) => index + 1);
      setIsLoading(true);
      return;
    }

    setAllFailed(true);
    setIsLoading(false);
  }, [activeIndex, candidates.length]);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    const img = event.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  }, []);

  // Determine best fit strategy based on image dimensions
  const objectFit = useMemo(() => {
    if (!imageSize) return 'cover';
    const aspectRatio = imageSize.width / imageSize.height;
    const isVeryWide = aspectRatio > 2.5;
    const isVeryTall = aspectRatio < 0.6;
    const isTooSmall = imageSize.width < 200 || imageSize.height < 150;

    return (isVeryWide || isVeryTall || isTooSmall) ? 'contain' : 'cover';
  }, [imageSize]);

  return (
    <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl border border-border/30 bg-muted/30 shadow-sm md:mt-0 md:ml-6 md:w-64 lg:w-72">
      {isLoading && hasImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl ?? undefined}
          alt={`Preview for ${alt}`}
          className="h-full w-full transition-opacity duration-200"
          style={{
            objectFit,
            opacity: isLoading ? 0 : 1,
          }}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/25 via-secondary/20 to-muted/30 text-foreground">
          <span className="text-3xl font-bold uppercase tracking-wide">{sourceInitials}</span>
          <span className="text-xs font-medium text-muted-foreground/80">{sourceName}</span>
        </div>
      )}
      {showVideoOverlay && hasImage && !isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
        </div>
      )}
    </div>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm px-4 py-4 md:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{t('title')}</h1>
              <p className="hidden md:block text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
            </div>
            <Badge variant="secondary" className="gap-1.5 text-xs">
              <Newspaper className="h-3 w-3" />
              {t('sourceLabel')}
            </Badge>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="border-b border-border/40 px-4 py-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {sourceFilters.map((filter) => {
              const isActive = source === filter.id;
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSource(filter.id)}
                  className="h-8 text-xs"
                >
                  {filter.label}
                </Button>
              );
            })}
            <Button
              variant={videosOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVideosOnly((prev) => !prev)}
              className="gap-1.5 h-8 text-xs"
            >
              <Video className="h-3 w-3" />
              {t('videosOnly')}
            </Button>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-10 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="hidden md:inline">{t('refresh')}</span>
                </span>
              ) : (
                <span className="hidden md:inline">{lastUpdatedLabel}</span>
              )}
              <Button variant="ghost" size="sm" onClick={handleRefresh} className="gap-1.5 h-7 px-2">
                <RefreshCcw className="h-3 w-3" />
                <span className="hidden md:inline">{t('refresh')}</span>
              </Button>
            </div>
          </div>

          {error && (
            <Card className="border-destructive/40 bg-destructive/10">
              <CardHeader className="p-3">
                <CardTitle className="text-sm text-destructive">{t('error')}</CardTitle>
                <CardDescription className="text-xs text-destructive mt-1">
                  {error}
                </CardDescription>
                <Button variant="destructive" size="sm" className="mt-3 w-fit h-8 text-xs" onClick={handleRefresh}>
                  {t('retry')}
                </Button>
              </CardHeader>
            </Card>
          )}

          {!error && meta?.errors && meta.errors.length > 0 && (
            <Card className="border-border/40 bg-muted/20">
              <CardHeader className="p-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground">{t('error')}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {meta.errors.join(' • ')}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {showSkeleton && (
            <div className="space-y-3">
              {SKELETON_PLACEHOLDERS.map((index) => (
                <SkeletonCard key={`news-skeleton-${index}`} />
              ))}
            </div>
          )}

          {!hasResults && !isLoading && !error && (
            <Card className="border-border/40 bg-card/50">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {t('noResults')}
              </CardContent>
            </Card>
          )}

          {hasResults && (
            <div className="divide-y divide-border/30">
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
                    className="group flex items-start gap-3 py-3 px-4 transition-colors hover:bg-muted/30 active:bg-muted/50"
                  >
                    {/* Left: Source Badge */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {getSourceInitials(item.sourceName)}
                      </div>
                    </div>

                    {/* Center: Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="font-medium">{item.sourceName}</span>
                        {publishedLabel && (
                          <>
                            <span>·</span>
                            <span>{publishedLabel}</span>
                          </>
                        )}
                        {hasVideos && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <PlayCircle className="h-3 w-3" />
                              {item.videos.length}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: External Link Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 text-center text-xs text-muted-foreground">
          <p>
            Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
