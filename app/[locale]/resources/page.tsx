'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ExternalLink, Search, PanelRightClose, PanelLeftOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
  const translateT = useTranslations('translate');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [data, setData] = useState<ResourceFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPanelDrawerOpen, setIsPanelDrawerOpen] = useState(false);
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

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => {
      setIsDesktop(media.matches);
    };

    handleChange();
    media.addEventListener('change', handleChange);

    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setPanelCollapsed(false);
      setIsPanelDrawerOpen(false);
    } else {
      setPanelCollapsed(true);
    }
  }, [isDesktop]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesSection = !sectionFilter || resource.section === sectionFilter;
      if (!matchesSection) return false;
      if (!term) return true;
      return (
        resource.title.toLowerCase().includes(term) ||
        resource.summary.toLowerCase().includes(term) ||
        resource.section.toLowerCase().includes(term)
      );
    });
  }, [query, resources, sectionFilter]);

  const updatedLabel = data
    ? t('updatedOn', {
        date: new Date(data.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      })
    : '';

  return (
    <div className="space-y-6">
      <section className="lab-hero" data-testid="resources-hero">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 text-muted-foreground"
            >
              <Link href={`/${locale}/translate`} aria-label={navT('backToDashboard')}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {navT('backToDashboard')}
              </Link>
            </Button>
          </div>
          <div className="space-y-1 text-balance">
            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">{t('badge')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{t('title')}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      <div className={cn('lab-grid', isDesktop && !panelCollapsed && 'has-panel')} data-testid="resources-workspace">
        <div className="space-y-4">
          <div className="space-y-4 rounded-3xl border border-border/60 bg-black/30 card-padding-lg md:p-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="h-12 rounded-2xl border-border/60 bg-transparent pl-12 text-sm"
                />
              </div>
              {data?.pdf ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-border/60 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  <a href={data.pdf.url} target="_blank" rel="noreferrer">
                    <span className="inline-flex items-center gap-2">
                      {data.pdf.label}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </a>
                </Button>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{updatedLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-border/60 text-sm font-semibold text-muted-foreground"
                onClick={() => setIsPanelDrawerOpen(true)}
              >
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
                {t('openAction')}
              </Button>
              {panelCollapsed && !isDesktop ? null : null}
            </div>
          </div>

          <section className="space-y-4 rounded-3xl border border-border/60 bg-black/30 card-padding-lg md:p-7">
            <div className="card-grid two">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => <ResourceSkeleton key={`resource-skeleton-${index}`} />)
                : filtered.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
            </div>
            {!loading && !filtered.length ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-black/30 card-padding text-sm text-muted-foreground">
                {t('emptyState')}
              </div>
            ) : null}
          </section>
        </div>

        {isDesktop ? (
          !panelCollapsed ? (
            <aside className="context-panel space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{t('openAction')}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full border border-border/60 text-muted-foreground"
                  onClick={() => setPanelCollapsed(true)}
                  aria-label={translateT('contextCollapse')}
                >
                  <PanelRightClose className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <PanelFilters
                sections={sections}
                sectionFilter={sectionFilter}
                onSelect={(title) => setSectionFilter((current) => (current === title ? null : title))}
                emptyLabel={t('emptyState')}
              />
            </aside>
          ) : (
            <div className="hidden lg:flex lg:flex-col lg:items-start lg:gap-2">
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full border-border/60 text-sm font-semibold text-muted-foreground"
                onClick={() => setPanelCollapsed(false)}
              >
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
                {t('openAction')}
              </Button>
            </div>
          )
        ) : null}
      </div>

      {!isDesktop && isPanelDrawerOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/40 lg:hidden" role="dialog" aria-modal>
          <button type="button" className="flex-1" aria-label={translateT('contextCollapse')} onClick={() => setIsPanelDrawerOpen(false)} />
          <div className="rounded-t-3xl border border-border/50 bg-background/90 card-padding shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{t('openAction')}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full border border-border/60 text-muted-foreground"
                onClick={() => setIsPanelDrawerOpen(false)}
                aria-label={translateT('contextCollapse')}
              >
                <PanelRightClose className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <PanelFilters
              sections={sections}
              sectionFilter={sectionFilter}
              onSelect={(title) => {
                setSectionFilter((current) => (current === title ? null : title));
                setIsPanelDrawerOpen(false);
              }}
              emptyLabel={t('emptyState')}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

type PanelFiltersProps = {
  sections: { id: string; title: string; count: number }[];
  sectionFilter: string | null;
  onSelect: (title: string) => void;
  emptyLabel: string;
};

function PanelFilters({ sections, sectionFilter, onSelect, emptyLabel }: PanelFiltersProps) {
  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          className={cn(
            'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition',
            sectionFilter === section.title
              ? 'border-primary bg-primary/10 text-white'
              : 'border-border/60 text-muted-foreground hover:text-foreground',
          )}
          onClick={() => onSelect(section.title)}
        >
          <span className="text-left leading-snug">{section.title}</span>
          <span className="text-xs">{section.count}</span>
        </button>
      ))}
      {sections.length === 0 ? <p className="text-xs text-muted-foreground">{emptyLabel}</p> : null}
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
      className="group flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-black/30 card-padding text-left transition hover:border-primary hover:bg-black/40"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{resource.section}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-white break-words">{resource.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground break-words">{resource.summary}</p>
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
    <div className="rounded-3xl border border-border/60 bg-black/30 card-padding">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-5 w-40" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  );
}
