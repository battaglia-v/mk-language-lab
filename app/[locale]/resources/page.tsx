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
    <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm px-4 py-4 md:py-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-lg md:text-xl font-bold text-foreground">
                  {t('subtitle')}
                </h1>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                  {t('title')}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                🇲🇰 {t('attributionText')}{' '}
                <a
                  href="https://macedonianlanguagecorner.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors underline decoration-dotted inline-flex items-center gap-1"
                >
                  {t('macedonianLanguageCorner')}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="border-b border-border/40 px-4 py-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('search')}
                className="h-10 rounded-lg pl-10 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={activeCollection === 'all' ? 'default' : 'outline'}
                onClick={() => handleCollectionSelect('all')}
                className="h-8 text-xs"
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
                  className="h-8 text-xs"
                >
                  {collection.title}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {pdfLink ? (
                <Button variant="ghost" size="sm" asChild className="h-7 gap-1.5 px-2">
                  <a href={pdfLink.url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3 w-3" />
                    {pdfLink.label || t('viewPdf')}
                  </a>
                </Button>
              ) : null}
              <span className="hidden md:inline">
                {t('updatedOn', {
                  date: updatedDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                })}
              </span>
              <span>{resultsSummary}</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {filteredCollections.length === 0 || totalMatches === 0 ? (
              <Card className="border-border/40 bg-card/50">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {t('noResults')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCollections.map((collection) => {
                  const Icon = collectionIcons[collection.icon] ?? BookMarked;
                  return (
                    <Card key={collection.slug} id={`collection-${collection.slug}`} className="border-border/40 bg-card/50">
                      <CardHeader className="p-4 pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base md:text-lg font-semibold text-foreground">{collection.title}</CardTitle>
                              <CardDescription className="text-xs md:text-sm text-muted-foreground mt-1">
                                {collection.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] md:text-xs font-semibold flex-shrink-0">
                            {collection.items.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                          {collection.items.map((item) => {
                            const FormatIcon = formatIcons[item.format] ?? FileText;
                            return (
                              <a
                                key={`${collection.slug}-${item.url}`}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block rounded-lg border border-border/40 bg-background/50 px-3 py-2.5 transition hover:border-primary/40 hover:bg-primary/5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground transition group-hover:text-primary">
                                      <span className="truncate">{item.title}</span>
                                      <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 flex-shrink-0" />
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                                  </div>
                                  <Badge variant="outline" className="flex items-center gap-1.5 text-[10px] flex-shrink-0 ml-2">
                                    <FormatIcon className="h-3 w-3" />
                                    <span className="hidden md:inline">{formatLabel(item.format)}</span>
                                  </Badge>
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

            {/* PDF Hint */}
            <Card className="mt-4 border-border/40 bg-card/50">
              <CardHeader className="p-4">
                <CardTitle className="text-sm md:text-base">{t('searchInDoc')}</CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground mt-1">
                  {t('pdfHint')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <footer className="border-t border-border/40 bg-card/30 py-4">
          <div className="mx-auto max-w-4xl px-4 text-center text-xs text-muted-foreground">
            <p>
              Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
            </p>
          </div>
        </footer>
      </div>
  );
}
