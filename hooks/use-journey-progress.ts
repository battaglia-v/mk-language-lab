"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type JourneyId, isJourneyId } from '@/data/journeys';

const STORAGE_KEY = 'mk-language-lab.journeyProgress.v1';
const MAX_ENTRIES_PER_JOURNEY = 180;

type JourneyProgressRecord = {
  sessions: string[];
};

type JourneyProgressStore = {
  version: number;
  journeys: Partial<Record<JourneyId, JourneyProgressRecord>>;
};

const INITIAL_STORE: JourneyProgressStore = {
  version: 1,
  journeys: {},
};

type JourneyProgressSnapshot = {
  stepsThisWeek: number;
  totalSessions: number;
  lastSessionIso: string | null;
};

type UseJourneyProgressReturn = JourneyProgressSnapshot & {
  isHydrated: boolean;
  logSession: (timestamp?: Date) => void;
};

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day of week
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() + diff);
  return weekStart;
}

function normaliseSessions(sessions: unknown): string[] {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions
    .map((entry) => {
      if (typeof entry !== 'string') {
        return null;
      }

      const timestamp = Date.parse(entry);
      if (Number.isNaN(timestamp)) {
        return null;
      }

      return new Date(timestamp).toISOString();
    })
    .filter((entry): entry is string => Boolean(entry))
    .slice(-MAX_ENTRIES_PER_JOURNEY);
}

function readStore(): JourneyProgressStore {
  if (typeof window === 'undefined') {
    return INITIAL_STORE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return INITIAL_STORE;
    }

    const parsed = JSON.parse(raw) as JourneyProgressStore;
    const journeys: JourneyProgressStore['journeys'] = {};

    Object.entries(parsed.journeys ?? {}).forEach(([key, value]) => {
      if (!isJourneyId(key)) {
        return;
      }

      journeys[key] = {
        sessions: normaliseSessions(value?.sessions),
      };
    });

    return {
      version: 1,
      journeys,
    };
  } catch (error) {
    console.error('Failed to parse journey progress store', error);
    return INITIAL_STORE;
  }
}

function persistStore(journeys: JourneyProgressStore['journeys']) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: JourneyProgressStore = {
    version: 1,
    journeys,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

const EMPTY_SNAPSHOT: JourneyProgressSnapshot = {
  lastSessionIso: null,
  stepsThisWeek: 0,
  totalSessions: 0,
};

export function useJourneyProgress(journeyId: JourneyId | null): UseJourneyProgressReturn {
  const [journeys, setJourneys] = useState<JourneyProgressStore['journeys']>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    if (isHydratingRef.current) {
      return;
    }

    isHydratingRef.current = true;
    const store = readStore();
    setJourneys(store.journeys);
    setIsHydrated(true);
  }, []);

  const snapshot: JourneyProgressSnapshot = useMemo(() => {
    if (!journeyId) {
      return EMPTY_SNAPSHOT;
    }

    const record = journeys[journeyId];

    if (!record) {
      return EMPTY_SNAPSHOT;
    }

    const sessions = record.sessions ?? [];

    if (sessions.length === 0) {
      return EMPTY_SNAPSHOT;
    }

    const orderedSessions = [...sessions].sort((a, b) => a.localeCompare(b));
    const lastSessionIso = orderedSessions[orderedSessions.length - 1] ?? null;
    const weekStart = getWeekStart(new Date());
    const weekStartTime = weekStart.getTime();

    const stepsThisWeek = orderedSessions.filter((iso) => {
      const timestamp = Date.parse(iso);
      return !Number.isNaN(timestamp) && timestamp >= weekStartTime;
    }).length;

    return {
      lastSessionIso,
      stepsThisWeek,
      totalSessions: orderedSessions.length,
    };
  }, [journeyId, journeys]);

  const logSession = useCallback(
    (timestamp: Date = new Date()) => {
      if (!journeyId) {
        return;
      }

      const iso = timestamp.toISOString();

      setJourneys((previous) => {
        const current = previous[journeyId] ?? { sessions: [] };
        const nextSessions = [...current.sessions, iso]
          .map((entry) => {
            const parsed = Date.parse(entry);
            return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
          })
          .filter((entry): entry is string => Boolean(entry))
          .slice(-MAX_ENTRIES_PER_JOURNEY);

        const updated: JourneyProgressStore['journeys'] = {
          ...previous,
          [journeyId]: {
            sessions: nextSessions,
          },
        };

        persistStore(updated);
        return updated;
      });
    },
    [journeyId]
  );

  return {
    ...snapshot,
    isHydrated,
    logSession,
  };
}

export type JourneyProgressForPrompt = {
  stepsThisWeek: number;
  lastSessionIso: string | null;
  totalSessions: number;
};

export function buildJourneyProgressPayload(journeyId: JourneyId | null, journeys: JourneyProgressStore['journeys']): JourneyProgressForPrompt | null {
  if (!journeyId) {
    return null;
  }

  const record = journeys[journeyId];

  if (!record) {
    return {
      lastSessionIso: null,
      stepsThisWeek: 0,
      totalSessions: 0,
    };
  }

  const sessions = normaliseSessions(record.sessions);
  const weekStart = getWeekStart(new Date()).getTime();

  return {
    lastSessionIso: sessions.length ? sessions[sessions.length - 1] : null,
    stepsThisWeek: sessions.filter((iso) => {
      const timestamp = Date.parse(iso);
      return !Number.isNaN(timestamp) && timestamp >= weekStart;
    }).length,
    totalSessions: sessions.length,
  };
}

export function summariseProgressForPrompt(snapshot: JourneyProgressForPrompt | null): string | null {
  if (!snapshot) {
    return null;
  }

  const lines = [
    `Steps logged this week: ${snapshot.stepsThisWeek}`,
    `Total sessions logged: ${snapshot.totalSessions}`,
  ];

  if (snapshot.lastSessionIso) {
    lines.push(`Last session timestamp (ISO): ${snapshot.lastSessionIso}`);
  } else {
    lines.push('No sessions have been logged yet.');
  }

  return lines.join('\n');
}
