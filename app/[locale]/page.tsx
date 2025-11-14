'use client';

import { useCallback, useMemo, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import clsx from 'clsx';
import { WebButton, WebCard, WebProgressRing, WebStatPill } from '@mk/ui';
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

  const shellClasses = 'section-container section-container-wide section-spacing-lg space-y-6 text-slate-100';
  const glassCard = 'backdrop-blur-[22px]';
  const cardSurfaceStyle: CSSProperties = {
    background: 'linear-gradient(140deg, rgba(7,11,24,0.95), rgba(17,23,41,0.9))',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#eff2ff',
    boxShadow: '0 35px 60px rgba(1,3,12,0.55)',
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(178,108,255,0.25),_transparent_65%)] blur-3xl opacity-80" />
      <div className={clsx('relative', shellClasses)} role="region" aria-label="Mission Control Dashboard">
        <header className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Mission Control
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            Stay on streak, power through missions, and keep every surface in sync.
          </h1>
          <p className="max-w-2xl text-base text-slate-300">
            The dashboard mirrors the mobile blueprint: streak-first hero, mission checklist, coach tips, review rails,
            and community highlights – all tuned for quick check-ins or deep study sessions.
          </p>
        </header>

        {missionState === 'error' ? (
          <ErrorBanner message={missionError ?? 'Unable to load mission data.'} onRetry={refreshMission} />
        ) : null}

        <MissionHero
          mission={mission}
          isLoading={missionState === 'loading'}
          buildHref={buildHref}
          cardClassName={glassCard}
          cardSurfaceStyle={cardSurfaceStyle}
        />

        <QuickActions
          actions={quickActions}
          isLoading={missionState === 'loading'}
          cardClassName={glassCard}
          cardSurfaceStyle={cardSurfaceStyle}
        />

        <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr]">
          <div className="space-y-6">
            <MissionChecklist
              checklist={mission.checklist}
              isLoading={missionState === 'loading'}
              cardClassName={glassCard}
              cardSurfaceStyle={cardSurfaceStyle}
            />
            <CoachTips
              tips={mission.coachTips}
              isLoading={missionState === 'loading'}
              cardClassName={glassCard}
              cardSurfaceStyle={cardSurfaceStyle}
            />
          </div>
          <ReviewClusters
            clusters={mission.reviewClusters}
            isLoading={missionState === 'loading'}
            cardClassName={glassCard}
            cardSurfaceStyle={cardSurfaceStyle}
          />
        </div>
      </div>
    </div>
  );
}

function MissionHero({
  mission,
  isLoading,
  buildHref,
  cardClassName = '',
  cardSurfaceStyle,
}: {
  mission: MissionStatus;
  isLoading: boolean;
  buildHref: (path: string) => string;
  cardClassName?: string;
  cardSurfaceStyle: CSSProperties;
}) {
  const xpProgress = mission.xp.target > 0 ? Math.min(mission.xp.earned / mission.xp.target, 1) : 0;
  const cycleEndsLabel = formatCycleWindow(mission.cycle.endsAt);
  const streakStat = `${mission.streakDays} day${mission.streakDays === 1 ? '' : 's'}`;
  const heartsStat = `${mission.heartsRemaining}/5 hearts`;

  return (
    <WebCard
      style={{ ...cardSurfaceStyle, padding: 32 }}
      className={clsx(cardClassName)}
      data-testid="mission-hero-card"
    >
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

function QuickActions({
  actions,
  isLoading,
  cardClassName = '',
  cardSurfaceStyle,
}: {
  actions: QuickAction[];
  isLoading: boolean;
  cardClassName?: string;
  cardSurfaceStyle: CSSProperties;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <WebCard
          key={action.id}
          style={{ ...cardSurfaceStyle, padding: 24 }}
          className={clsx(cardClassName, isLoading && 'animate-pulse opacity-70')}
        >
          <div
            className={clsx('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md', {
              'bg-[var(--brand-red,#e63946)]': action.accent === 'primary',
              'bg-[var(--brand-gold,#f4a261)] text-[#201404]': action.accent === 'secondary',
            })}
          >
            {action.icon}
          </div>
          <h3 className="text-lg font-semibold text-white">{action.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{action.description}</p>
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

function MissionChecklist({
  checklist,
  isLoading,
  cardClassName = '',
  cardSurfaceStyle,
}: {
  checklist: MissionStatus['checklist'];
  isLoading: boolean;
  cardClassName?: string;
  cardSurfaceStyle: CSSProperties;
}) {
  return (
    <WebCard style={{ ...cardSurfaceStyle, padding: 24 }} className={clsx(cardClassName)}>
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

function CoachTips({
  tips,
  isLoading,
  cardClassName = '',
  cardSurfaceStyle,
}: {
  tips: MissionStatus['coachTips'];
  isLoading: boolean;
  cardClassName?: string;
  cardSurfaceStyle: CSSProperties;
}) {
  return (
    <WebCard style={{ ...cardSurfaceStyle, padding: 24 }} className={clsx(cardClassName)}>
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

function ReviewClusters({
  clusters,
  isLoading,
  cardClassName = '',
  cardSurfaceStyle,
}: {
  clusters: MissionStatus['reviewClusters'];
  isLoading: boolean;
  cardClassName?: string;
  cardSurfaceStyle: CSSProperties;
}) {
  return (
    <WebCard style={{ ...cardSurfaceStyle, padding: 24 }} className={clsx(cardClassName)}>
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
