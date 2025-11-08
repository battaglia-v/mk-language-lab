'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Instagram, Loader2, AlertCircle, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { InstagramPost, InstagramPostsResponse } from '@/types/instagram';

type DailyLessonsProps = {
  limit?: number;
  showViewAll?: boolean;
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

export function DailyLessons({ limit = 9, showViewAll = false }: DailyLessonsProps) {
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
      <Card className="border-border/50 bg-card/60 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Instagram className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t('title')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && posts.length === 0) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Instagram className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t('title')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('error')}
              </p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" asChild>
              <a
                href="https://www.instagram.com/macedonianlanguagecorner"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-4 w-4" />
                {t('visitInstagram')}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Instagram className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">{t('title')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
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
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
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
            {posts.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>{t('noPosts')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => {
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
                      className="group block overflow-hidden rounded-xl border border-border/60 bg-card/40 transition hover:border-primary/40 hover:bg-primary/5"
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
                        <div className="absolute right-2 top-2 flex gap-2">
                          <Badge variant={mediaTypeBadge.variant} className="text-xs backdrop-blur-sm">
                            {mediaTypeBadge.label}
                          </Badge>
                        </div>
                        {session?.user && (
                          <button
                            onClick={(e) => void handleToggleSave(post, e)}
                            disabled={savingPostIds.has(post.id)}
                            className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all hover:bg-black/80 disabled:opacity-50"
                            aria-label={savedPostIds.has(post.id) ? 'Unsave post' : 'Save post'}
                          >
                            <Bookmark
                              className={`h-4 w-4 transition-all ${
                                savedPostIds.has(post.id)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        )}
                        {post.media_type === 'VIDEO' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
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
            ) : savedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('saved.noPosts')}</p>
                  <p className="text-xs text-muted-foreground">{t('saved.noPostsDescription')}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedPosts.map((post) => {
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
                      className="group block overflow-hidden rounded-xl border border-border/60 bg-card/40 transition hover:border-primary/40 hover:bg-primary/5"
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
                        <div className="absolute right-2 top-2 flex gap-2">
                          <Badge variant={mediaTypeBadge.variant} className="text-xs backdrop-blur-sm">
                            {mediaTypeBadge.label}
                          </Badge>
                        </div>
                        {session?.user && (
                          <button
                            onClick={(e) => void handleToggleSave(post, e)}
                            disabled={savingPostIds.has(post.id)}
                            className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all hover:bg-black/80 disabled:opacity-50"
                            aria-label={savedPostIds.has(post.id) ? 'Unsave post' : 'Save post'}
                          >
                            <Bookmark
                              className={`h-4 w-4 transition-all ${
                                savedPostIds.has(post.id)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        )}
                        {post.media_type === 'VIDEO' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
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
