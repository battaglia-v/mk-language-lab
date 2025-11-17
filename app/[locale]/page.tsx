'use client';

import { useCallback, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import clsx from 'clsx';
import { WebButton, WebProgressRing, WebStatPill } from '@mk/ui';
import { getLocalMissionStatus, type MissionStatus } from '@mk/api-client';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  Heart,
  Loader2,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useMissionStatusResource } from '@/hooks/useMissionStatus';
import { CollapsiblePanel } from '@/components/layout/CollapsiblePanel';

export default function HomePage() {
  const locale = useLocale();
  const {
    mission,
    state: missionState,
    error: missionError,
    refresh: refreshMission,
  } = useMissionStatusResource(getLocalMissionStatus());
  const buildHref = useCallback((path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`), [locale]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        id: 'continue',
        title: 'Continue mission',
        description: 'Jump back into Quick Practice with your current deck.',
        href: buildHref('/practice'),
        icon: <Target className="h-5 w-5" aria-hidden="true" />,
        accent: 'primary' as const,
      },
      {
        id: 'translator',
        title: 'Translator inbox',
        description: 'Review saved translations and weak vocab chips.',
        href: buildHref('/translate'),
        icon: <MessageCircle className="h-5 w-5" aria-hidden="true" />,
        accent: 'secondary' as const,
      },
    ],
    [buildHref]
  );

  return (
    <div className="minimal-shell">
      <div
        className="minimal-shell-content section-container section-container-wide section-spacing-xl"
        role="region"
        aria-label="Mission Control Dashboard"
      >
        <header className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Mission Control
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-[2.75rem]">
            Stay on streak with a calm dashboard designed for one clear action per fold.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Mission Control mirrors the mobile blueprint but pares it down to essentials: a streak-first hero and a slim CTA
            rail above the fold, with the rest tucked into calm accordions for deeper dives.
          </p>
        </header>

        {missionState === 'error' ? (
          <ErrorBanner message={missionError ?? 'Unable to load mission data.'} onRetry={refreshMission} />
        ) : null}

        <div className="fold-grid">
          <MissionHero mission={mission} isLoading={missionState === 'loading'} buildHref={buildHref} />
          <QuickActions actions={quickActions} isLoading={missionState === 'loading'} />
        </div>

        <div className="space-y-4" aria-label="Mission secondary modules">
          <CollapsiblePanel eyebrow="Checklist" title="Stay on target" description="Track the three tasks that keep your streak safe.">
            <MissionChecklist checklist={mission.checklist} isLoading={missionState === 'loading'} />
          </CollapsiblePanel>
          <CollapsiblePanel eyebrow="Coach tips" title="Micro-guidance" description="Short nudges from your coach when you have more time.">
            <CoachTips tips={mission.coachTips} isLoading={missionState === 'loading'} />
          </CollapsiblePanel>
          <CollapsiblePanel eyebrow="Review" title="Accuracy focus" description="See the weakest clusters only when you expand this rail.">
            <ReviewClusters clusters={mission.reviewClusters} isLoading={missionState === 'loading'} />
          </CollapsiblePanel>
        </div>
      </div>
    </div>
  );
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
    <section className="neutral-panel" data-testid="mission-hero-card">
      <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {mission.cycle.type} mission
            </span>
            <span className="text-sm text-muted-foreground">Resets {cycleEndsLabel}</span>
            {isLoading ? <LoadingBadge label="Refreshing" /> : null}
          </div>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">{mission.name}</h2>
          <p className="text-base text-muted-foreground">
            Earn {mission.xp.target} XP to stay in the streak club. Prioritize weak clusters and keep the translator inbox tidy.
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
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-muted p-6 text-center">
          <WebProgressRing progress={xpProgress} label="XP" value={`${mission.xp.earned}/${mission.xp.target}`} />
          <p className="text-sm text-muted-foreground">
            {xpProgress === 1 ? 'Target met! claim rewards' : 'Keep pushing – streak bonus unlocks at 100%.'}
          </p>
        </div>
      </div>
    </section>
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
    <aside className="neutral-panel neutral-panel-muted cta-rail" aria-label="Primary mission actions">
      {actions.map((action) => (
        <div key={action.id} className="rounded-2xl border border-dashed border-[var(--fold-border)] bg-white/70 p-4">
          <div
            className={clsx('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-foreground', {
              'bg-black/5 text-foreground': action.accent === 'primary',
              'bg-[#fdf8ee] text-foreground': action.accent === 'secondary',
            })}
          >
            {action.icon}
          </div>
          <h3 className="text-base font-semibold text-foreground">{action.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
          <Link href={action.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            {isLoading ? 'Loading…' : 'Open'}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ))}
    </aside>
  );
}

function MissionChecklist({
  checklist,
  isLoading,
}: {
  checklist: MissionStatus['checklist'];
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      {isLoading ? <LoadingBadge label="Syncing" /> : null}
      <ul className="space-y-3">
        {checklist.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--fold-border)] bg-white p-4">
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
    </div>
  );
}

function CoachTips({ tips, isLoading }: { tips: MissionStatus['coachTips']; isLoading: boolean }) {
  return (
    <div className="space-y-4">
      {isLoading ? <LoadingBadge label="Loading" /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {tips.map((tip) => (
          <div key={tip.id} className="rounded-2xl border border-[var(--fold-border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{tip.tag}</p>
            <h4 className="mt-2 text-base font-semibold text-foreground">{tip.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewClusters({ clusters, isLoading }: { clusters: MissionStatus['reviewClusters']; isLoading: boolean }) {
  return (
    <div className="space-y-4">
      {isLoading ? <LoadingBadge label="Loading" /> : null}
      <div className="space-y-4">
        {clusters.map((cluster) => (
          <div key={cluster.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{cluster.label}</span>
              <span className="text-muted-foreground">{Math.round(cluster.accuracy * 100)}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(cluster.accuracy * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
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
