'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useActiveJourney } from '@/hooks/use-active-journey';
import { useJourneyProgress } from '@/hooks/use-journey-progress';

function formatLastSession(locale: string, iso: string, justNowLabel: string): string {
  const timestamp = Date.parse(iso);

  if (Number.isNaN(timestamp)) {
    return '';
  }

  const last = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return justNowLabel;
  }

  if (diffMinutes < 60) {
    const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return relativeFormatter.format(-diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return relativeFormatter.format(-diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays <= 7) {
    const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return relativeFormatter.format(-diffDays, 'day');
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(last);
}

export function JourneyLastSessionStat() {
  const t = useTranslations('journey');
  const locale = useLocale();
  const { activeJourney } = useActiveJourney();
  const { isHydrated, lastSessionIso } = useJourneyProgress(activeJourney);

  const displayValue = useMemo(() => {
    if (!isHydrated || !activeJourney || !lastSessionIso) {
      return t('progress.stats.lastSession.value');
    }

    return (
      formatLastSession(locale, lastSessionIso, t('progress.stats.lastSession.justNow')) ||
      t('progress.stats.lastSession.value')
    );
  }, [activeJourney, isHydrated, lastSessionIso, locale, t]);

  return <span className="text-2xl font-semibold text-foreground">{displayValue}</span>;
}
