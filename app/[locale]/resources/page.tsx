'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterChip } from '@/components/ui/filter-chip';
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

type FlattenedResource = ResourceItem & {
  collectionTitle: string;
  collectionSlug: string;
  iconKey: string;
};

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

const formatLabelKeys: Record<ResourceFormat, `formats.${ResourceFormat}`> = {
  website: 'formats.website',
  video: 'formats.video',
  audio: 'formats.audio',
  podcast: 'formats.podcast',
  article: 'formats.article',
  document: 'formats.document',
};

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

  const flattenedResources = useMemo<FlattenedResource[]>(
    () =>
      collectionsWithSlug.flatMap((collection) =>
        collection.items.map((item) => ({
          ...item,
          collectionTitle: collection.title,
          collectionSlug: collection.slug,
          iconKey: collection.icon,
        }))
      ),
    [collectionsWithSlug]
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
    const params = new URLSearchParams();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }

    if (activeCollection !== 'all') {
      params.set('section', activeCollection);
    }

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [activeCollection, pathname, router, searchQuery]);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return flattenedResources.filter((resource) => {
      const matchesCollection = activeCollection === 'all' || resource.collectionSlug === activeCollection;
      if (!matchesCollection) {
        return false;
      }
      if (!query) {
        return true;
      }

      return (
        resource.title.toLowerCase().includes(query) ||
        resource.summary.toLowerCase().includes(query) ||
        resource.collectionTitle.toLowerCase().includes(query)
      );
    });
  }, [activeCollection, flattenedResources, searchQuery]);

  const totalMatches = filteredResources.length;
  const totalResources = flattenedResources.length;
  const updatedDate = new Date(resourceData.updatedAt);
  const resultsSummary = t('resultsSummary', { count: totalMatches, total: totalResources });
  const updatedLabel = t('updatedOn', {
    date: updatedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  });

  const handleCollectionSelect = (slug: string) => {
    setActiveCollection(slug);
  };

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section data-testid="resources-hero" className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-4 w-4" />
                {t('badge')}
              </span>
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
                <p className="text-sm text-slate-300">{updatedLabel}</p>
              </div>
            </div>

            {resourceData.pdf && (
              <div className="space-y-2 text-sm text-slate-300">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                  asChild
                >
                  <a href={resourceData.pdf.url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4" />
                    {resourceData.pdf.label || t('viewPdf')}
                  </a>
                </Button>
                <p className="text-xs text-slate-400">{t('pdfHint')}</p>
              </div>
            )}
          </div>
        </section>

        <section data-testid="resources-workspace" className="glass-card rounded-[32px] p-5 shadow-lg md:p-6">
          <div className="space-y-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('search')}
                className="h-11 rounded-2xl border border-white/10 bg-background/80 pl-11 text-sm text-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <FilterChip active={activeCollection === 'all'} onClick={() => handleCollectionSelect('all')}>
                {t('showAll')}
              </FilterChip>
              {collectionsWithSlug.map((collection) => (
                <FilterChip key={collection.slug} active={activeCollection === collection.slug} onClick={() => handleCollectionSelect(collection.slug)}>
                  {collection.title}
                </FilterChip>
              ))}
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

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>{resultsSummary}</span>
              <span>{updatedLabel}</span>
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <Card className="glass-card mt-6">
              <CardContent className="py-10 text-center text-sm text-slate-300">{t('noResults')}</CardContent>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {filteredResources.map((resource) => {
                const Icon = collectionIcons[resource.iconKey] ?? BookMarked;
                const FormatIcon = formatIcons[resource.format] ?? FileText;
                const formatLabel = t(formatLabelKeys[resource.format]);
                const ctaLabel = resource.format === 'document' ? t('viewPdf') : t('openResource');

                return (
                  <a
                    key={`${resource.collectionSlug}-${resource.url}`}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block h-full"
                  >
                    <Card className="glass-card flex h-full flex-col justify-between transition-shadow hover:border-primary/40 hover:shadow-2xl">
                      <CardHeader className="space-y-3 px-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-base text-white">{resource.title}</CardTitle>
                            <CardDescription className="text-xs text-slate-300">{resource.collectionTitle}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="w-fit gap-1.5 text-[11px] bg-white/10 text-white">
                          <FormatIcon className="h-3.5 w-3.5" />
                          {formatLabel}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4 px-0">
                        <p className="text-sm text-slate-200 line-clamp-3">{resource.summary}</p>
                        <div className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          {ctaLabel}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}
