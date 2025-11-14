'use client';

import { useProfileSummaryQuery } from '@mk/api-client';
import { useTranslations } from 'next-intl';
import { ProfileHeader } from './ProfileHeader';
import { QuestsSection } from './QuestsSection';
import { BadgesSection } from './BadgesSection';
import { StatsSection } from './StatsSection';

export function ProfileDashboard() {
  const t = useTranslations('profile');
  const { data: profile, isLoading, error } = useProfileSummaryQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">{t('error.title')}</h2>
          <p className="text-red-600">{error?.message || t('error.generic')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ProfileHeader
        name={profile.name}
        level={profile.level}
        xp={profile.xp}
        streakDays={profile.streakDays}
      />

      <StatsSection
        xp={profile.xp}
        streakDays={profile.streakDays}
        quests={profile.quests}
      />

      <QuestsSection />

      <BadgesSection badges={profile.badges} />
    </div>
  );
}
