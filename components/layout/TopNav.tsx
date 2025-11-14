'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, X, Flame, Heart, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { AjvarLogo } from '@/components/AjvarLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { UserMenu } from '@/components/auth/UserMenu';
import { CommandMenuLazy } from '@/components/CommandMenuLazy';
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
 * - Command menu (search)
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
  showMobileMenu = true,
  className,
  initialMission,
}: TopNavProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const brand = useTranslations('brand');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const brandLabel = brand('short');
  const {
    mission,
    state: missionState,
    error: missionError,
    refresh: refreshMission,
  } = useMissionStatusResource(initialMission);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const buildHref = (path: string) => `/${locale}${path}`;

  const navItems = [
    { path: '/', label: t('home') },
    { path: '/practice', label: t('practice') },
    { path: '/translate', label: t('translate') },
    { path: '/news', label: t('news') },
    { path: '/resources', label: t('resources') },
  ];

  const isActive = (path: string) => {
    const fullPath = buildHref(path);
    if (path === '/') {
      return pathname === fullPath;
    }
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

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
          'w-full border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm z-40',
          sticky && 'sticky top-0',
          className
        )}
        aria-label={t('label')}
      >
        <div className="section-container section-container-wide flex flex-col gap-3 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-2">
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
                aria-label={t('home')}
              >
                <AjvarLogo size={32} />
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-foreground">{brandLabel}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Macedonian Missions
                  </span>
                </div>
              </Link>

              <div className="hidden flex-1 flex-wrap items-center gap-1 lg:flex">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={buildHref(item.path)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                        'hover:bg-muted focus-visible:ring-1 focus-visible:ring-primary',
                        active ? 'text-primary bg-primary/10 shadow-sm' : 'text-foreground'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 lg:gap-3">
              <CommandMenuLazy />
              <LanguageSwitcher />
              <UserMenu />
              {showMobileMenu && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-lg p-2 transition-colors hover:bg-muted lg:hidden"
                  aria-label={mobileMenuOpen ? t('closeMenu') : t('openMenu')}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          <MissionSummaryBanner
            mission={mission}
            state={missionState}
            error={missionError}
            onRefresh={refreshMission}
            t={t}
          />
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            id="mobile-menu"
            className={cn(
              'lg:hidden overflow-hidden border-t border-border/40 transition-all duration-300 ease-in-out',
              mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            )}
            aria-hidden={!mobileMenuOpen}
          >
            <div className="section-container section-container-wide py-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={buildHref(item.path)}
                    className={cn(
                      'block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 touch-target',
                      'hover:bg-muted',
                      active ? 'text-primary bg-primary/10' : 'text-foreground'
                    )}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
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
};

function MissionSummaryBanner({ mission, state, error, onRefresh, t }: MissionSummaryBannerProps) {
  if (state === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-[var(--surface-elevated)] px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {t('summaryLoading')}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-error-border bg-error-soft px-4 py-3 text-sm text-error-strong">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span>{error ?? t('summaryError')}</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-error-border px-3 py-1 text-xs font-semibold text-error-strong transition-all hover:bg-error-border/10"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  const xpGoal = mission.xp.target || 1;
  const xpPercent = Math.max(0, Math.min(1, mission.xp.earned / xpGoal));

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/80 bg-[var(--surface-elevated)] px-4 py-4">
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
  );
}
