'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Instagram, Loader2, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterChip } from '@/components/ui/filter-chip';
import { cn } from '@/lib/utils';
import type { InstagramPost, InstagramPostsResponse } from '@/types/instagram';

type Tag = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string | null;
};

type DailyLessonsProps = {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
  dataTestId?: string;
};

/**
 * Format timestamp to relative time or date
 */
function formatPostDate(
  timestamp: string,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return t('timeAgo.justNow');
  }
  if (diffHours < 24) {
    return t('timeAgo.hoursAgo', { hours: diffHours });
  }
  if (diffDays === 1) {
    return t('timeAgo.yesterday');
  }
  if (diffDays < 7) {
    return t('timeAgo.daysAgo', { days: diffDays });
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Truncate caption text
 */
function truncateCaption(caption: string, maxLength: number = 150): string {
  if (caption.length <= maxLength) {
    return caption;
  }

  const truncated = caption.slice(0, maxLength).trim();
  const lastSpace = truncated.lastIndexOf(' ');

  return (lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Get media type badge variant
 */
function getMediaTypeBadge(
  mediaType: InstagramPost['media_type'],
  t: (key: string, values?: Record<string, string | number>) => string
): {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
} {
  switch (mediaType) {
    case 'VIDEO':
      return { label: t('mediaType.video'), variant: 'default' };
    case 'CAROUSEL_ALBUM':
      return { label: t('mediaType.album'), variant: 'secondary' };
    default:
      return { label: t('mediaType.image'), variant: 'outline' };
  }
}

export function DailyLessons({ limit = 9, showViewAll = false, className, dataTestId }: DailyLessonsProps) {
  const t = useTranslations('dailyLessons');
  const locale = useLocale();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [source, setSource] = useState<'instagram-graph-api' | 'mock'>('instagram-graph-api');
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [savingPostIds, setSavingPostIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('all');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [postTags, setPostTags] = useState<Map<string, Tag[]>>(new Map());

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/instagram/posts?limit=${limit}`);
        const data = (await response.json()) as InstagramPostsResponse;

        if (!response.ok) {
          throw new Error(data.meta.error || 'Failed to fetch Instagram posts');
        }

        setPosts(data.items);
        setCached(data.meta.cached);
        setSource(data.meta.source);

        if (data.meta.error) {
          setError(data.meta.error);
        }
      } catch (err) {
        setError((err as Error).message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchPosts();
  }, [limit]);

  // Fetch saved posts when user is logged in
  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!session?.user) {
        setSavedPostIds(new Set());
        setSavedPosts([]);
        return;
      }

      try {
        setLoadingSaved(true);
        const response = await fetch('/api/instagram/saved');
        if (response.ok) {
          const data = await response.json() as { items: InstagramPost[] };
          const ids = new Set(data.items.map((post) => post.id));
          setSavedPostIds(ids);
          setSavedPosts(data.items);
        }
      } catch (err) {
        console.error('Error fetching saved posts:', err);
      } finally {
        setLoadingSaved(false);
      }
    };

    void fetchSavedPosts();
  }, [session]);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json() as { tags: Tag[] };
          setTags(data.tags);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };

    void fetchTags();
  }, []);

  // Fetch tags for all posts in a single batch request
  useEffect(() => {
    const controller = new AbortController();

    const fetchPostTags = async () => {
      if (posts.length === 0) return;

      try {
        const response = await fetch('/api/instagram/posts/tags/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postIds: posts.map(p => p.id) }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json() as { tagsByPost: Record<string, Tag[]> };
          const newPostTags = new Map(Object.entries(data.tagsByPost));
          setPostTags(newPostTags);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error fetching post tags:', err);
        }
      }
    };

    void fetchPostTags();

    // Cleanup: abort in-flight requests on unmount
    return () => controller.abort();
  }, [posts]);

  // Toggle tag selection
  const toggleTagFilter = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  // Filter posts by selected tags
  const filterPostsByTags = (postsToFilter: InstagramPost[]) => {
    if (selectedTagIds.size === 0) {
      return postsToFilter;
    }

    return postsToFilter.filter((post) => {
      const tags = postTags.get(post.id) || [];
      return tags.some((tag) => selectedTagIds.has(tag.id));
    });
  };

  const filteredPosts = filterPostsByTags(posts);
  const filteredSavedPosts = filterPostsByTags(savedPosts);

  // Handle saving/unsaving a post
  const handleToggleSave = async (post: InstagramPost, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation to Instagram
    event.stopPropagation();

    if (!session?.user) {
      // Could show a toast or modal asking user to sign in
      return;
    }

    const isSaved = savedPostIds.has(post.id);
    setSavingPostIds((prev) => new Set(prev).add(post.id));

    try {
      if (isSaved) {
        // Unsave the post
        const response = await fetch(`/api/instagram/saved/${post.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSavedPostIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(post.id);
            return newSet;
          });
          setSavedPosts((prev) => prev.filter((p) => p.id !== post.id));
        }
      } else {
        // Save the post
        const response = await fetch('/api/instagram/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post }),
        });

        if (response.ok) {
          setSavedPostIds((prev) => new Set(prev).add(post.id));
          setSavedPosts((prev) => [...prev, post]);
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setSavingPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <Card className={cn('glass-card border border-white/10', className)} data-testid={dataTestId}>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <Instagram className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-white">{t('title')}</CardTitle>
                <CardDescription className="text-slate-300">{t('subtitle')}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <Instagram className="mr-2 h-4 w-4" />
                {t('follow')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`daily-lessons-skeleton-${index}`}
                className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && posts.length === 0) {
    return (
      <Card className={cn('glass-card border border-white/10', className)} data-testid={dataTestId}>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <Instagram className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-white">{t('title')}</CardTitle>
                <CardDescription className="text-slate-300">{t('subtitle')}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.instagram.com/macedonianlanguagecorner" target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-4 w-4" />
                {t('visitInstagram')}
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('glass-card border border-white/10', className)} data-testid={dataTestId}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Instagram className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-white">{t('title')}</CardTitle>
              <CardDescription className="text-slate-300">{t('subtitle')}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {source === 'mock' && (
              <Badge variant="secondary" className="text-xs">
                {t('demoMode')}
              </Badge>
            )}
            {cached && (
              <Badge variant="outline" className="text-xs">
                {t('cached')}
              </Badge>
            )}
            {showViewAll && (
              <Button variant="default" size="sm" asChild>
                <Link href={`/${locale}/daily-lessons`}>
                  {t('viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://www.instagram.com/macedonianlanguagecorner"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-4 w-4" />
                {t('follow')}
              </a>
            </Button>
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>{t('error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        {/* Tag Filters */}
        {tags.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-medium">{t('filterByTag')}:</span>
              {selectedTagIds.size > 0 && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0 text-xs font-medium"
                  onClick={() => setSelectedTagIds(new Set())}
                >
                  {t('clearFilters')}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.has(tag.id);
                return (
                  <FilterChip
                    key={tag.id}
                    active={isSelected}
                    onClick={() => toggleTagFilter(tag.id)}
                    style={
                      isSelected
                        ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' }
                        : undefined
                    }
                  >
                    {tag.icon && <span className="text-sm">{tag.icon}</span>}
                    <span>{tag.name}</span>
                  </FilterChip>
                );
              })}
            </div>
          </div>
        )}

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              {t('tabs.all')}
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookmarkCheck className="h-4 w-4" />
              {t('tabs.saved')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>{selectedTagIds.size > 0 ? t('noPostsWithTags') : t('noPosts')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => {
                  const mediaTypeBadge = getMediaTypeBadge(post.media_type, t);
                  const imageUrl =
                    post.media_type === 'VIDEO' && post.thumbnail_url
                      ? post.thumbnail_url
                      : post.media_url;

                  return (
                    <a
                      key={post.id}
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-primary/40 hover:bg-white/10"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          src={imageUrl}
                          alt={post.caption.slice(0, 100)}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute right-2 top-2 flex flex-wrap gap-1.5 max-w-[calc(100%-1rem)]">
                          <Badge variant={mediaTypeBadge.variant} className="text-xs backdrop-blur-sm">
                            {mediaTypeBadge.label}
                          </Badge>
                          {postTags.get(post.id)?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs backdrop-blur-sm"
                              style={{ backgroundColor: tag.color, color: 'white', borderColor: tag.color }}
                            >
                              {tag.icon} {tag.name}
                            </Badge>
                          ))}
                          {(postTags.get(post.id)?.length ?? 0) > 2 && (
                            <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                              +{(postTags.get(post.id)?.length ?? 0) - 2}
                            </Badge>
                          )}
                        </div>
                        {session?.user && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => void handleToggleSave(post, e)}
                            disabled={savingPostIds.has(post.id)}
                            className="absolute left-2 top-2 h-9 w-9 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80"
                            aria-label={savedPostIds.has(post.id) ? 'Unsave post' : 'Save post'}
                          >
                            <Bookmark
                              className={`h-4 w-4 transition-all ${
                                savedPostIds.has(post.id)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-white'
                              }`}
                            />
                          </Button>
                        )}
                        {post.media_type === 'VIDEO' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
                              <svg
                                className="h-6 w-6 text-black"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatPostDate(post.timestamp, t)}
                          </p>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="line-clamp-3 text-sm text-foreground">
                          {truncateCaption(post.caption)}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            {!session?.user ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('saved.signInRequired')}</p>
                  <p className="text-xs text-muted-foreground">{t('saved.signInDescription')}</p>
                </div>
              </div>
            ) : loadingSaved ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSavedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {selectedTagIds.size > 0 ? t('noPostsWithTags') : t('saved.noPosts')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTagIds.size > 0 ? t('tryDifferentTags') : t('saved.noPostsDescription')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSavedPosts.map((post) => {
                  const mediaTypeBadge = getMediaTypeBadge(post.media_type, t);
                  const imageUrl =
                    post.media_type === 'VIDEO' && post.thumbnail_url
                      ? post.thumbnail_url
                      : post.media_url;

                  return (
                    <a
                      key={post.id}
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-white/10 bg-white/5 transition hover:border-primary/40 hover:bg-white/10"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          src={imageUrl}
                          alt={post.caption.slice(0, 100)}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute right-2 top-2 flex flex-wrap gap-1.5 max-w-[calc(100%-1rem)]">
                          <Badge variant={mediaTypeBadge.variant} className="text-xs backdrop-blur-sm">
                            {mediaTypeBadge.label}
                          </Badge>
                          {postTags.get(post.id)?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs backdrop-blur-sm"
                              style={{ backgroundColor: tag.color, color: 'white', borderColor: tag.color }}
                            >
                              {tag.icon} {tag.name}
                            </Badge>
                          ))}
                          {(postTags.get(post.id)?.length ?? 0) > 2 && (
                            <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                              +{(postTags.get(post.id)?.length ?? 0) - 2}
                            </Badge>
                          )}
                        </div>
                        {session?.user && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => void handleToggleSave(post, e)}
                            disabled={savingPostIds.has(post.id)}
                            className="absolute left-2 top-2 h-9 w-9 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80"
                            aria-label={savedPostIds.has(post.id) ? 'Unsave post' : 'Save post'}
                          >
                            <Bookmark
                              className={`h-4 w-4 transition-all ${
                                savedPostIds.has(post.id)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-white'
                              }`}
                            />
                          </Button>
                        )}
                        {post.media_type === 'VIDEO' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
                              <svg
                                className="h-6 w-6 text-black"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">
                            {formatPostDate(post.timestamp, t)}
                          </p>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                        <p className="line-clamp-3 text-sm text-foreground">
                          {truncateCaption(post.caption)}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
