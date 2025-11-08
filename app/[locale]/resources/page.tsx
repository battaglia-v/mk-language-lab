'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Badge,
} from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  BookMarked,
  Clapperboard,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  Mic,
  Newspaper,
  Play,
  Search,
  Sparkles,
} from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import resourcesData from '@/data/resources.json';

type ResourceFormat = 'website' | 'video' | 'audio' | 'podcast' | 'article' | 'document';

type ResourceItem = {
  title: string;
  url: string;
  summary: string;
  format: ResourceFormat;
};

type ResourceCollection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: ResourceItem[];
};

type ResourceData = {
  updatedAt: string;
  pdf?: {
    label: string;
    url: string;
  };
  collections: ResourceCollection[];
};

type ExtendedCollection = ResourceCollection & { slug: string };

const collectionIcons: Record<string, LucideIcon> = {
  library: BookMarked,
  graduation: GraduationCap,
  clapperboard: Clapperboard,
  headphones: Headphones,
  newspaper: Newspaper,
};

const formatIcons: Record<ResourceFormat, LucideIcon> = {
  website: Globe,
  video: Play,
  audio: Headphones,
  podcast: Mic,
  article: Newspaper,
  document: FileText,
};

const formatFallbackLabel: Record<ResourceFormat, string> = {
  website: 'Website',
  video: 'Video',
  audio: 'Audio',
  podcast: 'Podcast',
  article: 'Article',
  document: 'Document',
};

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

export default function ResourcesPage() {
  const t = useTranslations('resources');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const resourceData = resourcesData as ResourceData;
  const collections = resourceData.collections;

  const collectionsWithSlug = useMemo<ExtendedCollection[]>(
    () =>
      collections.map((collection, index) => ({
        ...collection,
        slug: slugify(collection.id || collection.title, `collection-${index}`),
      })),
    [collections]
  );

  const sectionParamRaw = searchParams.get('section');
  const validCollectionParam = useMemo(() => {
    if (sectionParamRaw && collectionsWithSlug.some((collection) => collection.slug === sectionParamRaw)) {
      return sectionParamRaw;
    }
    return 'all';
  }, [sectionParamRaw, collectionsWithSlug]);

  const initialQuery = searchParams.get('q') ?? '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCollection, setActiveCollection] = useState(validCollectionParam);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setActiveCollection(validCollectionParam);
  }, [validCollectionParam]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window === 'undefined') {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const trimmedQuery = searchQuery.trim();

      if (trimmedQuery) {
        params.set('q', trimmedQuery);
      } else {
        params.delete('q');
      }

      if (activeCollection && activeCollection !== 'all') {
        params.set('section', activeCollection);
      } else {
        params.delete('section');
      }

      const nextQuery = params.toString();
      const currentQuery = window.location.search.replace(/^\?/, '');

      if (nextQuery !== currentQuery) {
        router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [activeCollection, pathname, router, searchQuery]);

  useEffect(() => {
    if (activeCollection === 'all') {
      return;
    }

    const element = document.getElementById(`collection-${activeCollection}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeCollection]);

  const filteredCollections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let workingCollections = collectionsWithSlug;

    if (activeCollection !== 'all') {
      workingCollections = workingCollections.filter((collection) => collection.slug === activeCollection);
    }

    if (!query) {
      return workingCollections;
    }

    return workingCollections
      .map((collection) => {
        const collectionMatches = collection.title.toLowerCase().includes(query) || collection.description.toLowerCase().includes(query);
        const matchingItems = collection.items.filter((item) => {
          const titleMatches = item.title.toLowerCase().includes(query);
          const summaryMatches = item.summary.toLowerCase().includes(query);
          const urlMatches = item.url.toLowerCase().includes(query);
          return titleMatches || summaryMatches || urlMatches;
        });

        if (matchingItems.length > 0) {
          return {
            ...collection,
            items: matchingItems,
          } satisfies ExtendedCollection;
        }

        return collectionMatches ? collection : null;
      })
      .filter((collection): collection is ExtendedCollection => Boolean(collection));
  }, [activeCollection, collectionsWithSlug, searchQuery]);

  const totalMatches = filteredCollections.reduce((acc, collection) => acc + collection.items.length, 0);
  const totalResources = collectionsWithSlug.reduce((acc, collection) => acc + collection.items.length, 0);
  const pdfLink = resourceData.pdf;
  const updatedDate = new Date(resourceData.updatedAt);
  const selectedCollection = activeCollection !== 'all' ? collectionsWithSlug.find((collection) => collection.slug === activeCollection) : null;
  const resultsSummary = t('resultsSummary', { count: totalMatches, total: totalResources });

  const handleCollectionSelect = (slug: string) => {
    setActiveCollection(slug);
  };

  const formatLabel = (format: ResourceFormat) => {
    try {
      return t(`formats.${format}` as const);
    } catch {
      return formatFallbackLabel[format];
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto mb-12 max-w-4xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {t('title')}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('subtitle')}
            </h1>

            <div className="inline-block px-6 py-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm md:text-base text-muted-foreground text-center">
                🇲🇰 {t('attributionText')}{' '}
                <a
                  href="https://macedonianlanguagecorner.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors underline decoration-dotted whitespace-nowrap inline-flex items-center gap-1"
                >
                  {t('macedonianLanguageCorner')}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </p>
            </div>

            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('search')}
                className="h-12 rounded-xl pl-10 text-lg"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              {pdfLink ? (
                <Button variant="outline" asChild className="gap-2">
                  <a href={pdfLink.url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" />
                    {pdfLink.label || t('viewPdf')}
                  </a>
                </Button>
              ) : null}
              <span>
                {t('updatedOn', {
                  date: updatedDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                })}
              </span>
              <span>{resultsSummary}</span>
              {selectedCollection && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-primary">
                  <Sparkles className="h-4 w-4" />
                  {selectedCollection.title}
                </span>
              )}
            </div>

            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={activeCollection === 'all' ? 'default' : 'outline'}
                  onClick={() => handleCollectionSelect('all')}
                >
                  {t('showAll')}
                </Button>
                {collectionsWithSlug.map((collection) => (
                  <Button
                    key={collection.slug}
                    type="button"
                    size="sm"
                    variant={activeCollection === collection.slug ? 'default' : 'outline'}
                    onClick={() => handleCollectionSelect(collection.slug)}
                  >
                    {collection.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-6xl">
            {filteredCollections.length === 0 || totalMatches === 0 ? (
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="py-12 text-center text-muted-foreground">
                  {t('noResults')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredCollections.map((collection) => {
                  const Icon = collectionIcons[collection.icon] ?? BookMarked;
                  return (
                    <Card key={collection.slug} id={`collection-${collection.slug}`} className="border-border/50 bg-card/60 backdrop-blur">
                      <CardHeader className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-semibold text-foreground">{collection.title}</CardTitle>
                              <CardDescription className="text-sm text-muted-foreground">
                                {collection.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wide">
                            {t('collectionCount', { count: collection.items.length })}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {collection.items.map((item) => {
                            const FormatIcon = formatIcons[item.format] ?? FileText;
                            return (
                              <a
                                key={`${collection.slug}-${item.url}`}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block rounded-xl border border-border/60 bg-card/40 px-4 py-4 transition hover:border-primary/40 hover:bg-primary/5"
                              >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div className="space-y-1 pr-0 md:pr-6">
                                    <p className="flex items-center gap-2 text-base font-semibold text-foreground transition group-hover:text-primary">
                                      {item.title}
                                      <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                                    </p>
                                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                                  </div>
                                  <div className="flex items-center gap-2 self-start md:self-center">
                                    <Badge variant="outline" className="flex items-center gap-2">
                                      <FormatIcon className="h-3.5 w-3.5" />
                                      {formatLabel(item.format)}
                                    </Badge>
                                  </div>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Card className="mt-8 border-border/60 bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur">
            <CardHeader>
              <CardTitle>{t('searchInDoc')}</CardTitle>
              <CardDescription className="pt-2 text-base text-muted-foreground">
                {t('pdfHint')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <footer className="mt-20 border-t border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
            <p>
              Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
            </p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
