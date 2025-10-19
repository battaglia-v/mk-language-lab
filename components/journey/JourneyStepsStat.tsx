'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useActiveJourney } from '@/hooks/use-active-journey';
import { useJourneyProgress } from '@/hooks/use-journey-progress';

export function JourneyStepsStat() {
  const t = useTranslations('journey');
  const { activeJourney } = useActiveJourney();
  const { isHydrated, stepsThisWeek } = useJourneyProgress(activeJourney);

  const displayValue = useMemo(() => {
    if (!isHydrated || !activeJourney) {
      return t('progress.stats.steps.value');
    }

    return stepsThisWeek.toString();
  }, [activeJourney, isHydrated, stepsThisWeek, t]);

  return <span className="text-2xl font-semibold text-foreground">{displayValue}</span>;
}
