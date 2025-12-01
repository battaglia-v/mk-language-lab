'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Flame, Heart, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AjvarLogo } from '@/components/AjvarLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { UserMenu } from '@/components/auth/UserMenu';
import type { MissionStatus } from '@mk/api-client';
import { useMissionStatusResource } from '@/hooks/useMissionStatus';
import type { MissionLoadState } from '@/hooks/useMissionStatus';

export interface TopNavProps {
  /**
   * Whether the nav should stick to the top of the viewport
   * @default true
   */
  sticky?: boolean;

  /**
   * Whether to show the mobile hamburger menu
   * @default true
   */
  showMobileMenu?: boolean;

  /**
   * Custom className for the nav container
   */
  className?: string;

  /**
   * Optional mission snapshot to seed the streak summary
   */
  initialMission?: MissionStatus;
}

/**
 * Top navigation bar component with logo, navigation links, and user actions.
 * Works alongside the existing Sidebar component.
 *
 * Features:
 * - Responsive mobile hamburger menu
 * - Language switcher
 * - User menu
 * - Sticky positioning
 * - Proper ARIA labels for accessibility
 *
 * @example
 * ```tsx
 * <TopNav sticky showMobileMenu />
 * ```
 */
export function TopNav({
  sticky = true,
  className,
  initialMission,
}: TopNavProps) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const brand = useTranslations('brand');
  const brandLabel = brand('short');
  const {
    mission,
    state: missionState,
    error: missionError,
    refresh: refreshMission,
  } = useMissionStatusResource(initialMission);

  // Close mobile menu when route changes
  const buildHref = (path: string) => `/${locale}${path}`;

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-nav-link"
      >
        {common('skipToContent')}
      </a>

      <nav
        className={cn(
          'nav-surface w-full border-b border-white/10 bg-[var(--mk-bg-surface)]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)] text-white',
          sticky && 'sticky safe-top',
          className
        )}
        aria-label={t('label')}
      >
        <div className="section-container section-container-wide nav-toolbar flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label={t('home')}
          >
            <AjvarLogo size={32} />
            <span className="text-base font-semibold text-white">{brandLabel}</span>
          </Link>

          <div className="flex items-center gap-2 lg:gap-3">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>

        <div className="nav-toolbar-helper section-container section-container-wide pb-3 hidden sm:block">
          <MissionSummaryBanner
            mission={mission}
            state={missionState}
            error={missionError}
            onRefresh={refreshMission}
            t={t}
            buildHref={buildHref}
          />
        </div>
      </nav>
    </>
  );
}

type NavTranslator = ReturnType<typeof useTranslations>;

type MissionSummaryBannerProps = {
  mission: MissionStatus;
  state: MissionLoadState;
  error?: string;
  onRefresh: () => void;
  t: NavTranslator;
  buildHref: (path: string) => string;
};

function MissionSummaryBanner({ mission, state, error, onRefresh, t, buildHref }: MissionSummaryBannerProps) {
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0f162e]/80 card-padding text-sm text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t('summaryLoading')}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-500/40 bg-red-900/20 card-padding text-sm text-red-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span>{error ?? t('summaryError')}</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="touch-target rounded-full border border-red-400/60 px-3 py-1 text-xs font-semibold text-red-100 transition-all hover:bg-red-500/20"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  const xpGoal = mission.xp.target || 1;
  const xpPercent = Math.max(0, Math.min(1, mission.xp.earned / xpGoal));

  const continueSubtitle = t('continueButtonSubtitle', {
    earned: mission.xp.earned,
    goal: mission.xp.target,
  });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-[#0f162e]/80 card-padding">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
            <Flame className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--brand-red)]">
              {t('streakLabel')}
            </p>
            <p className="text-base font-semibold text-foreground">
              {t('streakValue', { count: mission.streakDays })}
            </p>
          </div>
        </div>

        <div className="min-w-[180px] flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            {t('xpLabel')}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--surface-frosted)]">
            <div
              className="h-full rounded-full bg-[var(--brand-red)] transition-all duration-500"
              style={{ width: `${xpPercent * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-foreground">
            {t('xpValue', { earned: mission.xp.earned, goal: mission.xp.target })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-gold)]/20 text-[var(--brand-gold-dark)]">
            <Heart className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {t('heartsLabel')}
            </p>
            <p className="text-base font-semibold text-foreground">
              {t('heartsValue', { current: mission.heartsRemaining, total: 5 })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 md:w-[240px]">
        <Link
          href={buildHref('/practice')}
          className="flex flex-col rounded-2xl bg-[var(--brand-red)] px-4 py-3 text-white shadow-lg shadow-[rgba(255,79,94,0.35)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-background"
        >
          <span className="text-sm font-semibold">{t('quickActionPractice')}</span>
          <span className="text-xs text-white/85">{continueSubtitle}</span>
        </Link>
        <Link
          href={buildHref('/translate')}
          className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand-red)] focus-visible:ring-offset-background"
        >
          <span>{t('quickActionTranslate')}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
