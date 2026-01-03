'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Clapperboard,
  ExternalLink,
  FileText,
  Globe2,
  Headphones,
  Mic2,
  Newspaper,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { PageContainer } from '@/components/layout';

type ResourceFile = {
  updatedAt: string;
  pdf?: { label: string; url: string };
  collections: {
    id: string;
    title: string;
    description?: string;
    items: {
      title: string;
      url: string;
      summary: string;
      format?: string;
    }[];
  }[];
};

type FlatResource = {
  id: string;
  title: string;
  url: string;
  summary: string;
  section: string;
  format?: string;
};

type ResourceFormat = 'website' | 'podcast' | 'video' | 'audio' | 'article' | 'pdf';

const formatIcons: Record<ResourceFormat, LucideIcon> = {
  website: Globe2,
  podcast: Mic2,
  video: Clapperboard,
  audio: Headphones,
  article: Newspaper,
  pdf: FileText,
};

const getResourceIcon = (format?: string) => {
  const normalized = format?.toLowerCase() as ResourceFormat | undefined;
  return (normalized && formatIcons[normalized]) || BookOpen;
};

export default function ResourcesPage() {
  const t = useTranslations('resources');
  const [query, setQuery] = useState('');
  const [data, setData] = useState<ResourceFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    import('@/data/resources.json')
      .then((module) => {
        if (!active) return;
        setData(module.default as ResourceFile);
      })
      .catch((error) => {
        console.error('Failed to load resources', error);
        setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const resources = useMemo<FlatResource[]>(() => {
    if (!data) return [];
    return data.collections.flatMap((collection, collectionIndex) =>
      collection.items.map((item, itemIndex) => ({
        id: `${collection.id}-${collectionIndex}-${itemIndex}`,
        title: item.title,
        summary: item.summary,
        url: item.url,
        format: item.format,
        section: collection.title,
      })),
    );
  }, [data]);

  const sections = useMemo(
    () =>
      data?.collections.map((collection) => ({
        id: collection.id,
        title: collection.title,
        count: collection.items.length,
      })) ?? [],
    [data],
  );

  const filtered = useMemo(() => {
    let result = resources;

    // Filter by section
    if (sectionFilter) {
      result = result.filter((r) => r.section === sectionFilter);
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.summary.toLowerCase().includes(lowerQuery) ||
          r.section.toLowerCase().includes(lowerQuery),
      );
    }

    return result;
  }, [resources, sectionFilter, query]);

  // Format the updatedAt date in a readable format
  const formatUpdatedDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    // Use a readable format: "December 12, 2025"
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const updatedLabel = data?.updatedAt
    ? t('updatedOn', { date: formatUpdatedDate(data.updatedAt) })
    : '';

  return (
    <PageContainer size="xl" className="flex flex-col gap-3 pb-24 sm:gap-4 sm:pb-6">
      {/* Compact Header - Mobile First */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('title', { default: 'Resources' })}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle', { default: 'Learning materials and guides' })}</p>
        </div>
        {data?.pdf && (
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <a href={data.pdf.url} target="_blank" rel="noreferrer" data-testid="resources-pdf-desktop">
              <ExternalLink className="mr-2 h-4 w-4" />
              {data.pdf.label}
            </a>
          </Button>
        )}
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder', { default: 'Search resources...' })}
          className="h-12 rounded-xl pl-10"
          data-testid="resources-search-input"
        />
      </div>

      {/* Horizontal Scrollable Filter Chips - Mobile First */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <FilterChip
          active={!sectionFilter}
          onClick={() => setSectionFilter(null)}
          className="h-9 px-4 text-sm"
          data-testid="resources-filter-all"
        >
          All
          {!sectionFilter && (
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
              {resources.length}
            </span>
          )}
        </FilterChip>
        {sections.map((section) => (
          <FilterChip
            key={section.id}
            active={sectionFilter === section.title}
            onClick={() => setSectionFilter(section.title)}
            className="h-9 px-4 text-sm"
            data-testid={`resources-filter-${section.id}`}
          >
            {section.title}
            {sectionFilter === section.title && (
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                {section.count}
              </span>
            )}
          </FilterChip>
        ))}
      </div>

      {/* Updated Label - styled as a subtle badge */}
      {updatedLabel && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {updatedLabel}
          </span>
        </div>
      )}

      {/* Resource Cards Grid - Mobile First */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-3 sm:grid-cols-2 sm:gap-4"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-4"
            >
              <Skeleton className="h-4 w-24 bg-white/10" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-full bg-white/10" />
                <Skeleton className="h-3 w-5/6 bg-white/10" />
                <Skeleton className="h-3 w-2/3 bg-white/10" />
              </div>
            </div>
          ))
        ) : (
          filtered.map((resource) => (
            <motion.a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              variants={staggerItem}
              className={cn(
                'group relative flex gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-card/80 sm:gap-4 sm:p-4',
              )}
              data-testid={`resources-item-${resource.id}`}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                {(() => {
                  const ResourceIcon = getResourceIcon(resource.format);
                  return <ResourceIcon className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />;
                })()}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <h3 className="min-w-0 text-sm font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-primary sm:text-base">
                    {resource.title}
                  </h3>
                  <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                  {resource.summary}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-1">{resource.section}</span>
                  {resource.format && (
                    <span className="rounded-full bg-muted px-2 py-1">
                      {resource.format}
                    </span>
                  )}
                </div>
              </div>
            </motion.a>
          ))
        )}
      </motion.div>

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {query
              ? t('noResults', { default: 'No resources found matching your search.' })
              : t('emptyState', { default: 'No resources available.' })}
          </p>
        </div>
      )}

      {/* Mobile PDF Download Button */}
      {data?.pdf && (
        <Button
          asChild
          className="sm:hidden w-full whitespace-normal break-words text-sm leading-relaxed px-4 py-3 h-auto min-h-[52px] justify-start text-left gap-2 rounded-xl"
          size="lg"
        >
          <a
            href={data.pdf.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 w-full"
            data-testid="resources-pdf-mobile"
          >
            <ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="text-left break-words">{data.pdf.label}</span>
          </a>
        </Button>
      )}
    </PageContainer>
  );
}
