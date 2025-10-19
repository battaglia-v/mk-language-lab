'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isJourneyId, type JourneyId } from '@/data/journeys';

const STORAGE_KEY = 'mk-language-lab.activeJourney';

type ActiveJourneyState = {
  activeJourney: JourneyId | null;
  isHydrated: boolean;
  setActiveJourney: (journey: JourneyId) => void;
  clearActiveJourney: () => void;
};

function readStoredJourney(): JourneyId | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  return isJourneyId(stored) ? stored : null;
}

export function useActiveJourney(): ActiveJourneyState {
  const [activeJourney, setActiveJourneyState] = useState<JourneyId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredJourney();

    if (stored) {
      setActiveJourneyState(stored);
    }

    setIsHydrated(true);
  }, []);

  const setActiveJourney = useCallback((journey: JourneyId) => {
    setActiveJourneyState(journey);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, journey);
    }
  }, []);

  const clearActiveJourney = useCallback(() => {
    setActiveJourneyState(null);

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return useMemo(
    () => ({ activeJourney, isHydrated, setActiveJourney, clearActiveJourney }),
    [activeJourney, clearActiveJourney, isHydrated, setActiveJourney]
  );
}
