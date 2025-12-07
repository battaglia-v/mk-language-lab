'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

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

  const updatedLabel = data?.updatedAt
    ? `${t('updated', { default: 'Last updated' })}: ${new Date(data.updatedAt).toLocaleDateString()}`
    : '';

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 pb-24 sm:gap-4 sm:pb-6">
      {/* Compact Header - Mobile First */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t('title', { default: 'Resources' })}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle', { default: 'Learning materials and guides' })}</p>
        </div>
        {data?.pdf && (
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <a href={data.pdf.url} target="_blank" rel="noreferrer">
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
        />
      </div>

      {/* Horizontal Scrollable Filter Chips - Mobile First */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSectionFilter(null)}
          className={cn(
            'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors',
            !sectionFilter
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-muted',
          )}
        >
          All
          {!sectionFilter && (
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
              {resources.length}
            </span>
          )}
        </button>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setSectionFilter(section.title)}
            className={cn(
              'inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors',
              sectionFilter === section.title
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-muted',
            )}
          >
            {section.title}
            {sectionFilter === section.title && (
              <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                {section.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Updated Label */}
      {updatedLabel && (
        <p className="text-xs text-muted-foreground">{updatedLabel}</p>
      )}

      {/* Resource Cards Grid - Mobile First */}
      {/* @ts-expect-error - framer-motion type compatibility issue with Next.js 16 */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid gap-3 sm:grid-cols-2 sm:gap-4"
      >
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))
          : filtered.map((resource) => (
              // @ts-expect-error - framer-motion type compatibility issue with Next.js 16
              <motion.a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                variants={staggerItem}
                className={cn(
                  'group relative flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-card/80 sm:p-4',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary sm:text-base">
                    {resource.title}
                  </h3>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                  {resource.summary}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5">{resource.section}</span>
                  {resource.format && (
                    <span className="rounded-full bg-muted px-2 py-0.5">{resource.format}</span>
                  )}
                </div>
              </motion.a>
            ))}
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
        <Button asChild className="sm:hidden" size="lg">
          <a href={data.pdf.url} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            {data.pdf.label}
          </a>
        </Button>
      )}
    </div>
  );
}
