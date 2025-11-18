'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

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

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return resources;
    return resources.filter((resource) =>
      resource.title.toLowerCase().includes(term) ||
      resource.summary.toLowerCase().includes(term) ||
      resource.section.toLowerCase().includes(term),
    );
  }, [query, resources]);

  const updatedLabel = data
    ? t('updatedOn', {
        date: new Date(data.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      })
    : '';

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{t('badge')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            {t('openAction')}
          </div>
        </div>
      </section>

      <div className="glass-card space-y-4 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-12 rounded-2xl border-border/60 bg-background/70 pl-12 text-sm"
            />
          </div>
          {data?.pdf ? (
            <a
              href={data.pdf.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              {data.pdf.label}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">{updatedLabel}</p>
      </div>

      <div className="card-grid two">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <ResourceSkeleton key={`resource-skeleton-${index}`} />)
          : filtered.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        {!loading && !filtered.length ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
            {t('emptyState')}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ResourceCardProps = {
  resource: FlatResource;
};

function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-background/70 p-5 text-left transition hover:border-primary hover:bg-background"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{resource.section}</p>
        <h3 className="mt-2 text-lg font-semibold text-white">{resource.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{resource.summary}</p>
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>{resource.format ?? 'link'}</span>
        <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
      </div>
    </a>
  );
}

function ResourceSkeleton() {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/70 p-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  );
}
