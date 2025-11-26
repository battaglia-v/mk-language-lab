'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useFormatter, useTranslations } from 'next-intl';
import { PageNavigation, getLearningTabs } from '@/components/navigation/PageNavigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterChip } from '@/components/ui/filter-chip';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  DiscoverCard,
  DiscoverCardAccent,
  DiscoverCategory,
  DiscoverCommunityHighlight,
  DiscoverEvent,
  DiscoverFeed,
  DiscoverQuestHighlight,
} from '@mk/api-client';
import { CalendarClock, MapPin, RefreshCcw, ExternalLink, Sparkles, Compass } from 'lucide-react';

const CATEGORY_SKELETONS = Array.from({ length: 2 }, (_, index) => index);
const CARD_SKELETONS = Array.from({ length: 4 }, (_, index) => index);

const ACCENT_STYLES: Record<DiscoverCardAccent, string> = {
  plum: 'from-fuchsia-500/20 via-fuchsia-500/10 to-transparent border-fuchsia-400/40 text-fuchsia-100',
  gold: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-300/50 text-amber-100',
  navy: 'from-sky-500/20 via-sky-500/10 to-transparent border-sky-400/40 text-sky-100',
  mint: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-400/40 text-emerald-100',
  red: 'from-rose-500/20 via-rose-500/10 to-transparent border-rose-400/40 text-rose-100',
};

function CTAIcon() {
  return <ExternalLink className="h-3.5 w-3.5" aria-hidden />;
}

type LoadOptions = { signal?: AbortSignal; silent?: boolean };

type Formatter = ReturnType<typeof useFormatter>;

export default function DiscoverPage() {
  const t = useTranslations('discover');
  const formatter = useFormatter();
  const [feed, setFeed] = useState<DiscoverFeed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadFeed = useCallback(
    async ({ signal, silent }: LoadOptions = {}) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        setError(null);
        const response = await fetch('/api/discover/feed', {
          signal,
          next: { revalidate: 60 },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch discover feed (status ${response.status})`);
        }
        const payload = (await response.json()) as DiscoverFeed;
        setFeed(payload);
        setUpdatedAt(new Date());
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError((err as Error).message);
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    loadFeed({ signal: controller.signal });
    return () => controller.abort();
  }, [loadFeed]);

  const categories = useMemo(() => feed?.categories ?? [], [feed]);
  const events = useMemo(() => feed?.events ?? [], [feed]);
  const questHighlights = useMemo(() => feed?.quests ?? [], [feed]);
  const communityHighlights = useMemo(() => feed?.community ?? [], [feed]);

  const categoryFilters = useMemo(
    () => [
      { id: 'all', label: t('filters.all') },
      ...categories.map((category) => ({ id: category.id, label: category.label })),
    ],
    [categories, t]
  );

  const visibleCategories = useMemo<DiscoverCategory[]>(() => {
    if (!categories.length) {
      return [];
    }
    if (selectedCategoryId === 'all') {
      return categories;
    }
    return categories.filter((category) => category.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const handleRefresh = useCallback(() => {
    loadFeed({ silent: true });
  }, [loadFeed]);

  return (
    <div className="section-container section-container-xl section-spacing-lg">
      <PageNavigation breadcrumbs={[{ label: t('hero.title'), href: '/discover' }]} tabs={getLearningTabs()} />
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-primary/10 via-background to-background p-8 text-foreground shadow-lg">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1 text-xs uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              {t('hero.badge')}
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t('hero.title')}
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">{t('hero.subtitle')}</p>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl bg-background/60 p-6 shadow-inner lg:max-w-sm">
            <p className="text-sm font-medium text-muted-foreground">{t('hero.systemsTitle')}</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" aria-hidden />
                {t('hero.systemsDiscover')}
              </li>
              <li className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
                {t('hero.systemsEvents')}
              </li>
            </ul>
            <div className="text-xs text-muted-foreground/80">
              {updatedAt ? (
                <span>{t('hero.updated', { time: formatter.relativeTime(updatedAt) })}</span>
              ) : (
                <span>{t('hero.ready')}</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} aria-hidden />
              {isRefreshing ? t('actions.refreshing') : t('actions.refresh')}
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="discover-categories" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('categories.label')}</p>
            <h2 id="discover-categories" className="text-2xl font-semibold text-foreground">
              {t('categories.title')}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <FilterChip
                key={filter.id}
                active={selectedCategoryId === filter.id}
                onClick={() => setSelectedCategoryId(filter.id)}
                disabled={isLoading && !feed}
              >
                {filter.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>{t('error.title')}</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>{t('error.description')}</span>
              <Button variant="secondary" size="sm" className="self-start" onClick={handleRefresh}>
                {t('actions.retry')}
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {isLoading && !feed ? (
          <div className="space-y-10">
            {CATEGORY_SKELETONS.map((section) => (
              <div key={section} className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-64" />
                <div className="grid gap-4 md:grid-cols-2">
                  {CARD_SKELETONS.map((card) => (
                    <Skeleton key={card} className="h-48 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {visibleCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        )}

        {!isLoading && !visibleCategories.length && !error ? (
          <p className="text-sm text-muted-foreground">{t('categories.empty')}</p>
        ) : null}
      </section>

      <QuestRail
        isLoading={isLoading && !feed}
        quests={questHighlights}
        error={error}
        onRetry={handleRefresh}
      />

      <section aria-labelledby="discover-events" className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('events.label')}</p>
          <h2 id="discover-events" className="text-2xl font-semibold text-foreground">
            {t('events.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('events.subtitle')}</p>
        </div>
        {isLoading && !feed ? (
          <div className="grid gap-4 md:grid-cols-2">
            {CARD_SKELETONS.slice(0, 2).map((card) => (
              <Skeleton key={card} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : events.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} formatter={formatter} />
            ))}
          </div>
        ) : (
          <Card className="glass-card border border-dashed border-white/10">
            <CardContent className="space-y-2 py-8 text-center">
              <p className="text-base font-medium text-foreground">{t('events.emptyTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('events.emptyBody')}</p>
            </CardContent>
          </Card>
        )}
      </section>

      <CommunityRail
        isLoading={isLoading && !feed}
        highlights={communityHighlights}
      />
    </div>
  );
}

type CategorySectionProps = {
  category: DiscoverCategory;
};

function CategorySection({ category }: CategorySectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{category.label}</p>
        <p className="text-base text-muted-foreground">{category.summary}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {category.cards.map((card) => (
          <DiscoverCardEntry key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

type DiscoverCardEntryProps = {
  card: DiscoverCard;
};

function DiscoverCardEntry({ card }: DiscoverCardEntryProps) {
  const accentClasses = ACCENT_STYLES[card.accent] ?? ACCENT_STYLES.plum;
  const isExternal = card.ctaTarget === 'external';
  const href = card.ctaUrl ?? '#';

  const Action = (
    <Button variant="secondary" size="sm" className="gap-2" asChild>
      {isExternal ? (
        <a href={href} target="_blank" rel="noreferrer">
          {card.cta}
          <CTAIcon />
        </a>
      ) : (
        <Link href={href}>
          {card.cta}
          <CTAIcon />
        </Link>
      )}
    </Button>
  );

  return (
    <Card className={cn('glass-card border border-white/10 bg-gradient-to-br', accentClasses)}>
      <CardHeader className="space-y-3">
        <Badge variant="outline" className="w-fit border-white/40 bg-black/30 text-xs text-white/90">
          {card.tag}
        </Badge>
        <CardTitle className="text-xl font-semibold text-white">{card.title}</CardTitle>
        <CardDescription className="text-sm text-white/80">{card.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm text-white/80">
        <span>{card.duration}</span>
        <div>{Action}</div>
      </CardContent>
    </Card>
  );
}

type EventCardProps = {
  event: DiscoverEvent;
  formatter: Formatter;
};

function EventCard({ event, formatter }: EventCardProps) {
  const startDate = new Date(event.startAt);
  const relativeLabel = Number.isNaN(startDate.getTime())
    ? null
    : formatter.relativeTime(startDate, { style: 'narrow' });
  const absoluteLabel = Number.isNaN(startDate.getTime())
    ? null
    : formatter.dateTime(startDate, { dateStyle: 'medium', timeStyle: 'short' });
  const isExternal = event.ctaTarget === 'external';
  const href = event.ctaUrl ?? '#';

  const CTA = (
    <Button size="sm" variant="secondary" className="gap-2" asChild>
      {isExternal ? (
        <a href={href} target="_blank" rel="noreferrer">
          {event.cta}
          <CTAIcon />
        </a>
      ) : (
        <Link href={href}>
          {event.cta}
          <CTAIcon />
        </Link>
      )}
    </Button>
  );

  return (
    <Card className="glass-card border border-white/10">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">{event.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground">
          <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
          <div className="flex flex-col">
            {absoluteLabel ? <span>{absoluteLabel}</span> : null}
            {relativeLabel ? <span className="text-xs text-muted-foreground">{relativeLabel}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" aria-hidden />
          <span>{event.location}</span>
        </div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{event.host}</div>
        {CTA}
      </CardContent>
    </Card>
  );
}

type QuestRailProps = {
  isLoading: boolean;
  quests: DiscoverQuestHighlight[];
  error: string | null;
  onRetry: () => void;
};

function QuestRail({ isLoading, quests, error, onRetry }: QuestRailProps) {
  const t = useTranslations('discover.quests');
  return (
    <section aria-labelledby="discover-quests" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('label')}</p>
          <h2 id="discover-quests" className="text-2xl font-semibold text-foreground">
            {t('title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {error ? (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            {t('retry')}
          </Button>
        ) : null}
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {CARD_SKELETONS.slice(0, 2).map((card) => (
            <Skeleton key={`quest-skeleton-${card}`} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : quests.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {quests.map((quest) => (
            <article key={quest.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/5 to-background p-4 text-white">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-primary">
                <span>{quest.type}</span>
                {quest.deadlineLabel ? <span>{quest.deadlineLabel}</span> : null}
              </div>
              <h3 className="mt-2 text-xl font-semibold">{quest.title}</h3>
              <p className="text-sm text-white/80">{quest.progressLabel}</p>
              <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                  style={{ width: `${quest.progressPercent}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-white/80">
                <div className="flex items-center gap-3">
                  <span>+{quest.xpReward} XP</span>
                  <span>+{quest.currencyReward} 💎</span>
                </div>
                <Button size="sm" variant="secondary" className="gap-2" asChild>
                  <Link href={quest.ctaUrl ?? '/practice'}>
                    {quest.cta}
                    <CTAIcon />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">{t('empty')}</CardContent>
        </Card>
      )}
    </section>
  );
}

type CommunityRailProps = {
  isLoading: boolean;
  highlights: DiscoverCommunityHighlight[];
};

function CommunityRail({ isLoading, highlights }: CommunityRailProps) {
  const t = useTranslations('discover.community');
  return (
    <section aria-labelledby="discover-community" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('label')}</p>
        <h2 id="discover-community" className="text-2xl font-semibold text-foreground">
          {t('title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {CARD_SKELETONS.slice(0, 3).map((card) => (
            <Skeleton key={`community-skeleton-${card}`} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : highlights.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((entry) => (
            <Card key={entry.id} className="glass-card border border-white/10">
              <CardHeader>
                <CardTitle className="text-base text-foreground">{entry.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{entry.highlightLabel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{entry.summary}</p>
                <div className="text-xs text-muted-foreground/80">
                  {new Date(entry.updatedAt).toLocaleString()}
                </div>
                <Button size="sm" variant="ghost" className="gap-2 text-primary" asChild>
                  <Link href={entry.ctaUrl ?? '/profile'}>
                    {entry.cta}
                    <CTAIcon />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">{t('empty')}</CardContent>
        </Card>
      )}
    </section>
  );
}
