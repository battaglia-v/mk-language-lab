'use client';

import Link from 'next/link';
import { useLeagueStandingsQuery, useProfileSummaryQuery } from '@mk/api-client';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ProfileHeader } from './ProfileHeader';
import { QuestsSection } from './QuestsSection';
import { BadgesSection } from './BadgesSection';
import { StatsSection } from './StatsSection';
import { BadgeShopPreview } from './BadgeShopPreview';
import { LeagueStandingsCard } from './LeagueStandingsCard';
import { ProfileActivityMap } from './ProfileActivityMap';
import { Button } from '@/components/ui/button';

type ProfileDashboardProps = {
  className?: string;
  dataTestId?: string;
};

export function ProfileDashboard({ className, dataTestId }: ProfileDashboardProps) {
  const t = useTranslations('profile');
  const common = useTranslations('common');
  const locale = useLocale();
  const { status } = useSession();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const {
    data: profile,
    isLoading,
    error,
    refetch: refetchProfile,
    isFetching,
  } = useProfileSummaryQuery({
    baseUrl: apiBaseUrl,
    enabled: status === 'authenticated',
  });
  const {
    data: leagueStandings,
    isLoading: isLeagueLoading,
    error: leagueError,
  } = useLeagueStandingsQuery({
    baseUrl: apiBaseUrl,
    enabled: status === 'authenticated',
  });

  const containerClasses = cn('space-y-5 lg:space-y-6', className);

  if (status === 'loading' || isLoading) {
    return (
      <div className={containerClasses} data-testid={dataTestId}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`profile-skeleton-${index}`} className="glass-card rounded-3xl p-6 md:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 rounded-full bg-white/10" />
              <div className="h-4 w-1/2 rounded-full bg-white/5" />
              <div className="h-20 rounded-2xl bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status !== 'authenticated') {
    const signInHref = `/${locale}/sign-in?callbackUrl=/${locale}/profile`;

    return (
      <div className={containerClasses} data-testid={dataTestId}>
        <div className="glass-card rounded-3xl border border-border/60 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">{t('signIn.title')}</p>
          <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{t('signIn.subtitle')}</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">{t('signIn.body')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="px-6">
              <Link href={signInHref}>{t('signIn.cta')}</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="px-6 text-slate-200">
              <Link href={`/${locale}`}>{t('signIn.secondary')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={containerClasses} data-testid={dataTestId}>
        <div className="glass-card rounded-3xl border border-destructive/40 p-6 text-sm text-red-100">
          <h2 className="text-lg font-semibold text-white">{t('error.title')}</h2>
          <p className="mt-1 text-red-100/90">{error?.message || t('error.generic')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => void refetchProfile()} size="sm" variant="secondary">
              {isFetching ? common('loading') : common('tryAgain')}
            </Button>
            <Button asChild size="sm" variant="ghost" className="text-slate-200">
              <Link href={`/${locale}/practice`}>{common('goHome')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses} data-testid={dataTestId}>
      <ProfileHeader
        name={profile.name}
        level={profile.level}
        xp={profile.xp}
        streakDays={profile.streakDays}
        xpProgress={profile.xpProgress}
        hearts={profile.hearts}
        league={profile.league}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <StatsSection
            xp={profile.xp}
            xpProgress={profile.xpProgress}
            streakDays={profile.streakDays}
            quests={profile.quests}
            hearts={profile.hearts}
            currency={profile.currency}
            league={profile.league}
          />

          <QuestsSection />

          <ProfileActivityMap entries={profile.activityHeatmap} />
        </div>

        <div className="space-y-5 lg:col-span-5">
          <LeagueStandingsCard data={leagueStandings} isLoading={isLeagueLoading} error={leagueError} />

          <BadgeShopPreview />

          <BadgesSection badges={profile.badges} />
        </div>
      </div>
    </div>
  );
}
