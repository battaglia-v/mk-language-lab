'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import clsx from 'clsx';
import { WebButton, WebCard, WebProgressRing, WebStatPill } from '@mk/ui';
import {
  getLocalDiscoverFeed,
  getLocalMissionStatus,
  getLocalNewsFeed,
  type DiscoverFeed,
  type MissionStatus,
  type NewsItem,
} from '@mk/api-client';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  Heart,
  Loader2,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useMissionStatusResource, type MissionLoadState } from '@/hooks/useMissionStatus';

type LoadState = MissionLoadState;

type ResourceState<TData> = {
  data: TData;
  state: LoadState;
  error?: string;
  refresh: () => void;
};

export default function HomePage() {
  const locale = useLocale();
  const {
    mission,
    state: missionState,
    error: missionError,
    refresh: refreshMission,
  } = useMissionStatusResource(getLocalMissionStatus());
  const {
    data: discoverFeed,
    state: discoverState,
    error: discoverError,
    refresh: refreshDiscover,
  } = useDiscoverFeedResource();
  const {
    data: newsItems,
    state: newsState,
    error: newsError,
    refresh: refreshNews,
  } = useNewsFeedResource();

  const buildHref = useCallback((path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`), [locale]);

  const quickActions = useMemo(
    () => [
      {
        id: 'continue',
        title: 'Continue mission',
        description: 'Jump back into Quick Practice with your current deck.',
        href: buildHref(mission.links?.practice ?? '/practice'),
        icon: <Target className="h-5 w-5" aria-hidden="true" />,
        accent: 'primary' as const,
      },
      {
        id: 'translator',
        title: 'Translator inbox',
        description: 'Review saved translations and weak vocab chips.',
        href: buildHref(mission.links?.translatorInbox ?? '/translate'),
        icon: <MessageCircle className="h-5 w-5" aria-hidden="true" />,
        accent: 'secondary' as const,
      },
      {
        id: 'reminders',
        title: 'Reminder windows',
        description: 'Tune streak nudges and mission deadlines.',
        href: buildHref(mission.links?.settings ?? '/practice'),
        icon: <Bell className="h-5 w-5" aria-hidden="true" />,
        accent: 'secondary' as const,
      },
    ],
    [buildHref, mission.links?.practice, mission.links?.settings, mission.links?.translatorInbox]
  );

  const shellClasses = 'mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-12 xl:max-w-6xl md:py-12';

  return (
    <div className="bg-[var(--surface-muted,#faf8f5)] text-foreground">
      <div className={shellClasses} role="region" aria-label="Mission Control Dashboard">
        <header className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-red)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Mission Control
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            Stay on streak, power through missions, and keep every surface in sync.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            The dashboard mirrors the mobile blueprint: streak-first hero, mission checklist, coach tips, review rails,
            and community highlights – all tuned for quick check-ins or deep study sessions.
          </p>
        </header>

        {missionState === 'error' ? (
          <ErrorBanner message={missionError ?? 'Unable to load mission data.'} onRetry={refreshMission} />
        ) : null}

        <MissionHero mission={mission} isLoading={missionState === 'loading'} buildHref={buildHref} />

        <QuickActions actions={quickActions} isLoading={missionState === 'loading'} />

        <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
          <div className="space-y-6">
            <MissionChecklist checklist={mission.checklist} isLoading={missionState === 'loading'} />
            <CoachTips tips={mission.coachTips} isLoading={missionState === 'loading'} />
          </div>
          <div className="space-y-6">
            <ReviewClusters clusters={mission.reviewClusters} isLoading={missionState === 'loading'} />
            <CommunityHighlights highlights={mission.communityHighlights} isLoading={missionState === 'loading'} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
          <DiscoverSpotlight
            feed={discoverFeed}
            state={discoverState}
            error={discoverError}
            onRetry={refreshDiscover}
            buildHref={buildHref}
          />
          <NewsHeadlines
            stories={newsItems}
            state={newsState}
            error={newsError}
            onRetry={refreshNews}
          />
        </div>
      </div>
    </div>
  );
}

function useDiscoverFeedResource(): ResourceState<DiscoverFeed> {
  const fallback = useMemo(() => getLocalDiscoverFeed(), []);
  const [feed, setFeed] = useState<DiscoverFeed>(fallback);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string>();
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setState('loading');
      setError(undefined);
      try {
        const response = await fetch('/api/discover/feed', {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const payload = (await response.json()) as DiscoverFeed;
        if (!cancelled) {
          setFeed(payload);
          setState('ready');
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        console.warn('Failed to load discover feed', err);
        setState('error');
        setError('Showing offline discover cards. Retry to refresh.');
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshToken]);

  const refresh = () => setRefreshToken((token) => token + 1);

  return { data: feed, state, error, refresh };
}

function useNewsFeedResource(): ResourceState<NewsItem[]> {
  const fallback = useMemo(() => getLocalNewsFeed(), []);
  const [news, setNews] = useState<NewsItem[]>(fallback);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string>();
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setState('loading');
      setError(undefined);
      try {
        const response = await fetch('/api/news', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }
        const payload = (await response.json()) as { items?: NewsItem[] } | NewsItem[];
        const items = Array.isArray(payload) ? payload : payload.items ?? [];
        if (!cancelled) {
          setNews(items);
          setState('ready');
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        console.warn('Failed to load news feed', err);
        setState('error');
        setError('Showing cached headlines. Retry to refresh.');
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshToken]);

  const refresh = () => setRefreshToken((token) => token + 1);

  return { data: news, state, error, refresh };
}

function MissionHero({
  mission,
  isLoading,
  buildHref,
}: {
  mission: MissionStatus;
  isLoading: boolean;
  buildHref: (path: string) => string;
}) {
  const xpProgress = mission.xp.target > 0 ? Math.min(mission.xp.earned / mission.xp.target, 1) : 0;
  const cycleEndsLabel = formatCycleWindow(mission.cycle.endsAt);
  const streakStat = `${mission.streakDays} day${mission.streakDays === 1 ? '' : 's'}`;
  const heartsStat = `${mission.heartsRemaining}/5 hearts`;

  return (
    <WebCard style={{ padding: 32 }}>
      <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--brand-red,#e63946)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--brand-red,#e63946)]">
              {mission.cycle.type} mission
            </span>
            <span className="text-sm text-muted-foreground">Resets {cycleEndsLabel}</span>
            {isLoading ? <LoadingBadge label="Refreshing" /> : null}
          </div>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{mission.name}</h2>
          <p className="text-base text-muted-foreground">
            Earn {mission.xp.target} XP to stay in the streak club. Celebrate wins, prioritize weak clusters, and keep the translator inbox tidy.
          </p>
          <div className="flex flex-wrap gap-3">
            <WebStatPill icon={<Flame className="h-4 w-4" aria-hidden="true" />} label="Streak" value={streakStat} accent="gold" />
            <WebStatPill icon={<Heart className="h-4 w-4" aria-hidden="true" />} label="Hearts" value={heartsStat} accent="green" />
            <WebStatPill
              icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
              label="Translator"
              value={mission.translatorDirection}
              accent="red"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <WebButton asChild>
              <Link href={buildHref(mission.links?.practice ?? '/practice')}>Continue mission</Link>
            </WebButton>
            <WebButton asChild variant="ghost">
              <Link href={buildHref('/discover')}>Browse Discover</Link>
            </WebButton>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-[var(--brand-gold,#f4a261)]/10 via-white to-[var(--brand-plum,#7a4988)]/15 p-6">
          <WebProgressRing progress={xpProgress} label="XP" value={`${mission.xp.earned}/${mission.xp.target}`} />
          <p className="text-sm text-muted-foreground">
            {xpProgress === 1 ? 'Target met! claim rewards' : 'Keep pushing – streak bonus unlocks at 100%.'}
          </p>
        </div>
      </div>
    </WebCard>
  );
}

type QuickAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  accent: 'primary' | 'secondary';
};

function QuickActions({ actions, isLoading }: { actions: QuickAction[]; isLoading: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <WebCard key={action.id} style={{ padding: 24 }} className={clsx(isLoading && 'animate-pulse opacity-80')}>
          <div
            className={clsx('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white', {
              'bg-[var(--brand-red,#e63946)]': action.accent === 'primary',
              'bg-[var(--brand-gold,#f4a261)] text-[var(--brand-red-dark,#8e1b2a)]': action.accent === 'secondary',
            })}
          >
            {action.icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground">{action.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
          <Link
            href={action.href}
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-red,#e63946)]"
          >
            Open
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </WebCard>
      ))}
    </div>
  );
}

function MissionChecklist({ checklist, isLoading }: { checklist: MissionStatus['checklist']; isLoading: boolean }) {
  return (
    <WebCard style={{ padding: 24 }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-gold-dark,#c0841a)]">Mission checklist</p>
          <h3 className="text-xl font-semibold">Stay on target</h3>
        </div>
        {isLoading ? <LoadingBadge label="Syncing" /> : null}
      </div>
      <ul className="mt-6 space-y-4">
        {checklist.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border/40 p-4">
            <div className="flex items-start gap-3">
              <StatusIcon status={item.status} />
              <div>
                <p className="text-base font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{statusCopy[item.status]}</p>
              </div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{item.status}</span>
          </li>
        ))}
      </ul>
    </WebCard>
  );
}

function CoachTips({ tips, isLoading }: { tips: MissionStatus['coachTips']; isLoading: boolean }) {
  return (
    <WebCard style={{ padding: 24 }}>
      <SectionHeader title="Coach tips" subtitle="Micro-guidance" isLoading={isLoading} />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tips.map((tip) => (
          <div key={tip.id} className="rounded-2xl border border-border/30 p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--brand-plum,#7a4988)]">{tip.tag}</p>
            <h4 className="mt-2 text-base font-semibold text-foreground">{tip.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
          </div>
        ))}
      </div>
    </WebCard>
  );
}

function ReviewClusters({ clusters, isLoading }: { clusters: MissionStatus['reviewClusters']; isLoading: boolean }) {
  return (
    <WebCard style={{ padding: 24 }}>
      <SectionHeader title="Smart review" subtitle="Accuracy focus" isLoading={isLoading} />
      <div className="mt-6 space-y-4">
        {clusters.map((cluster) => (
          <div key={cluster.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{cluster.label}</span>
              <span className="text-muted-foreground">{Math.round(cluster.accuracy * 100)}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-border/50">
              <div
                className="h-full rounded-full bg-[var(--brand-red,#e63946)]"
                style={{ width: `${Math.min(cluster.accuracy * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </WebCard>
  );
}

function CommunityHighlights({
  highlights,
  isLoading,
}: {
  highlights: MissionStatus['communityHighlights'];
  isLoading: boolean;
}) {
  return (
    <WebCard style={{ padding: 24 }}>
      <SectionHeader title="Community" subtitle="Keep the momentum" isLoading={isLoading} />
      <ul className="mt-6 space-y-4">
        {highlights.map((highlight) => (
          <li key={highlight.id} className="rounded-2xl border border-border/40 p-4">
            <p className="text-sm font-semibold text-foreground">{highlight.title}</p>
            <p className="text-sm text-muted-foreground">{highlight.detail}</p>
          </li>
        ))}
      </ul>
    </WebCard>
  );
}

function DiscoverSpotlight({
  feed,
  state,
  error,
  onRetry,
  buildHref,
}: {
  feed: DiscoverFeed;
  state: LoadState;
  error?: string;
  onRetry: () => void;
  buildHref: (path: string) => string;
}) {
  const featuredCards = useMemo(() => {
    const cards = feed.categories.flatMap((category) =>
      category.cards.map((card) => ({ ...card, category: category.label }))
    );
    return cards.slice(0, 3);
  }, [feed]);
  const events = feed.events.slice(0, 2);

  return (
    <WebCard style={{ padding: 24 }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-gold-dark,#c0841a)]">Discover</p>
          <h3 className="text-xl font-semibold">Editorial spotlight</h3>
        </div>
        {state === 'loading' ? <LoadingBadge label="Loading" /> : null}
      </div>
      {state === 'error' ? <InlineErrorNotice message={error ?? 'Offline discover feed.'} onRetry={onRetry} /> : null}
      <div className="mt-6 space-y-4">
        {featuredCards.map((card) => (
          <div key={card.id} className="rounded-2xl border border-border/30 p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--brand-plum,#7a4988)]">{card.category}</p>
            <h4 className="mt-1 text-base font-semibold text-foreground">{card.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{card.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{card.duration}</span>
              <span>•</span>
              <span>{card.tag}</span>
              <Link href={buildHref('/discover')} className="ml-auto inline-flex items-center gap-1 text-[var(--brand-red,#e63946)]">
                {card.cta}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}
        {events.length > 0 ? (
          <div className="rounded-2xl border border-border/40 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-gold-dark,#c0841a)]">
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Upcoming sessions
            </p>
            <div className="mt-3 space-y-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-border/40 p-3">
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.host} · {event.location}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.startAt)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                  <Link
                    href={buildHref('/discover')}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-red,#e63946)]"
                  >
                    {event.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </WebCard>
  );
}

function NewsHeadlines({
  stories,
  state,
  error,
  onRetry,
}: {
  stories: NewsItem[];
  state: LoadState;
  error?: string;
  onRetry: () => void;
}) {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    []
  );
  const topStories = stories.slice(0, 4);

  return (
    <WebCard style={{ padding: 24 }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-gold-dark,#c0841a)]">Headlines</p>
          <h3 className="text-xl font-semibold">Language news</h3>
        </div>
        {state === 'loading' ? <LoadingBadge label="Refreshing" /> : null}
      </div>
      {state === 'error' ? <InlineErrorNotice message={error ?? 'Offline headlines.'} onRetry={onRetry} /> : null}
      <ul className="mt-6 space-y-4">
        {topStories.map((story) => (
          <li key={story.id} className="rounded-2xl border border-border/40 p-4">
            <p className="text-sm font-semibold text-foreground">{story.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {story.sourceName} · {formatter.format(new Date(story.publishedAt))}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{story.description}</p>
            <a
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-red,#e63946)]"
            >
              Read article
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      {topStories.length === 0 ? <p className="text-sm text-muted-foreground">No stories available right now.</p> : null}
    </WebCard>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-red,#e63946)]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
        </button>
      </div>
    </div>
  );
}

function InlineErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 flex w-full items-center justify-between rounded-2xl border border-dashed border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-700"
    >
      <span className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" aria-hidden="true" /> {message}
      </span>
      <span className="inline-flex items-center gap-1 font-semibold">
        Retry <RefreshCw className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}

function SectionHeader({ title, subtitle, isLoading }: { title: string; subtitle: string; isLoading: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-gold-dark,#c0841a)]">{title}</p>
        <h3 className="text-xl font-semibold">{subtitle}</h3>
      </div>
      {isLoading ? <LoadingBadge label="Loading" /> : null}
    </div>
  );
}

function StatusIcon({ status }: { status: MissionStatus['checklist'][number]['status'] }) {
  const base = 'flex h-10 w-10 items-center justify-center rounded-2xl border';
  if (status === 'completed') {
    return (
      <span className={clsx(base, 'border-green-200 bg-green-50 text-green-600')}>
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className={clsx(base, 'border-amber-200 bg-amber-50 text-amber-500')}>
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className={clsx(base, 'border-slate-200 bg-slate-50 text-slate-400')}>
      <Circle className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

const statusCopy: Record<MissionStatus['checklist'][number]['status'], string> = {
  completed: 'Locked in – XP added to your streak.',
  in_progress: 'In progress – resume when ready.',
  pending: 'Queued for later today.',
};

function LoadingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background px-3 py-1 text-xs font-semibold uppercase text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      {label}
    </span>
  );
}

function formatCycleWindow(isoDate: string) {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) {
    return 'soon';
  }
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) {
    return 'now';
  }
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes >= 60) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `in ${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  }
  return `in ${diffMinutes}m`;
}

function formatDate(isoDate: string) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? 'Soon' : formatter.format(date);
}
