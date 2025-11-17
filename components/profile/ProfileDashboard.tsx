'use client';

import { useLeagueStandingsQuery, useProfileSummaryQuery } from '@mk/api-client';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ProfileHeader } from './ProfileHeader';
import { QuestsSection } from './QuestsSection';
import { BadgesSection } from './BadgesSection';
import { StatsSection } from './StatsSection';
import { BadgeShopPreview } from './BadgeShopPreview';
import { LeagueStandingsCard } from './LeagueStandingsCard';
import { ProfileActivityMap } from './ProfileActivityMap';

type ProfileDashboardProps = {
  className?: string;
  dataTestId?: string;
};

export function ProfileDashboard({ className, dataTestId }: ProfileDashboardProps) {
  const t = useTranslations('profile');
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { data: profile, isLoading, error } = useProfileSummaryQuery({
    baseUrl: apiBaseUrl,
  });
  const {
    data: leagueStandings,
    isLoading: isLeagueLoading,
    error: leagueError,
  } = useLeagueStandingsQuery({
    baseUrl: apiBaseUrl,
  });

  const containerClasses = cn('space-y-6', className);

  if (isLoading) {
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

  if (error || !profile) {
    return (
      <div className={containerClasses} data-testid={dataTestId}>
        <div className="glass-card rounded-3xl border border-destructive/40 p-6 text-sm text-red-100">
          <h2 className="text-lg font-semibold text-white">{t('error.title')}</h2>
          <p className="mt-1 text-red-100/90">{error?.message || t('error.generic')}</p>
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

      <StatsSection
        xp={profile.xp}
        xpProgress={profile.xpProgress}
        streakDays={profile.streakDays}
        quests={profile.quests}
        hearts={profile.hearts}
        currency={profile.currency}
        league={profile.league}
      />

      <LeagueStandingsCard data={leagueStandings} isLoading={isLeagueLoading} error={leagueError} />

      <QuestsSection />

      <ProfileActivityMap entries={profile.activityHeatmap} />

      <BadgeShopPreview />

      <BadgesSection badges={profile.badges} />
    </div>
  );
}
