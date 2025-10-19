'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useActiveJourney } from '@/hooks/use-active-journey';

export function ActiveJourneyStat() {
  const t = useTranslations('journey');
  const { activeJourney, isHydrated } = useActiveJourney();

  const displayValue = useMemo(() => {
    if (!isHydrated || !activeJourney) {
      return t('progress.stats.activeGoal.value');
    }

    return t(`goals.cards.${activeJourney}.title`);
  }, [activeJourney, isHydrated, t]);

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="text-2xl font-semibold text-foreground"
    >
      {displayValue}
    </span>
  );
}
