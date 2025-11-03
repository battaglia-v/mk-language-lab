"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type JourneyId, isJourneyId } from '@/data/journeys';

const STORAGE_KEY = 'mk-language-lab.journeyProgress.v1';
const MAX_ENTRIES_PER_JOURNEY = 180;
const DEFAULT_SESSION_DURATION_MINUTES = 15;

type JourneySessionEntry = {
  startedAt: string;
  durationMinutes?: number;
};

type JourneyProgressRecord = {
  sessions: JourneySessionEntry[];
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
  streakCount: number;
  sessionsToday: number;
  minutesToday: number;
  minutesThisWeek: number;
  totalMinutes: number;
};

type UseJourneyProgressReturn = JourneyProgressSnapshot & {
  isHydrated: boolean;
  logSession: (options?: { timestamp?: Date; durationMinutes?: number }) => void;
};

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day of week
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() + diff);
  return weekStart;
}

function normaliseSessions(sessions: unknown): JourneySessionEntry[] {
  if (!Array.isArray(sessions)) {
    return [];
  }

  const entries: JourneySessionEntry[] = [];

  sessions.forEach((entry) => {
    if (!entry) {
      return;
    }

    if (typeof entry === 'string') {
      const timestamp = Date.parse(entry);
      if (!Number.isNaN(timestamp)) {
        entries.push({ startedAt: new Date(timestamp).toISOString() });
      }
      return;
    }

    if (typeof entry === 'object') {
      const candidate = entry as Record<string, unknown>;
      const startedAtRaw = typeof candidate.startedAt === 'string' ? candidate.startedAt : typeof candidate.timestamp === 'string' ? candidate.timestamp : null;

      if (!startedAtRaw) {
        return;
      }

      const timestamp = Date.parse(startedAtRaw);

      if (Number.isNaN(timestamp)) {
        return;
      }

      const durationValue = candidate.durationMinutes;
      const parsedDuration = typeof durationValue === 'number' && Number.isFinite(durationValue)
        ? Math.max(0, durationValue)
        : undefined;

      entries.push({
        startedAt: new Date(timestamp).toISOString(),
        durationMinutes: parsedDuration,
      });
    }
  });

  return entries
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
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
  streakCount: 0,
  sessionsToday: 0,
  minutesToday: 0,
  minutesThisWeek: 0,
  totalMinutes: 0,
};

function toUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDayKey(key: string): Date | null {
  const [yearStr, monthStr, dayStr] = key.split('-');
  const year = Number.parseInt(yearStr ?? '', 10);
  const month = Number.parseInt(monthStr ?? '', 10);
  const day = Number.parseInt(dayStr ?? '', 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function differenceInDays(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

function calculateStreak(sessionDayKeys: string[]): number {
  if (sessionDayKeys.length === 0) {
    return 0;
  }

  const uniqueDayKeys = Array.from(new Set(sessionDayKeys)).sort((a, b) => a.localeCompare(b));
  const latestKey = uniqueDayKeys[uniqueDayKeys.length - 1];
  const latestDate = parseDayKey(latestKey);

  if (!latestDate) {
    return 0;
  }

  const todayMidnight = toUtcMidnight(new Date());
  const differenceFromToday = differenceInDays(todayMidnight, latestDate);

  if (differenceFromToday > 1) {
    return 0;
  }

  let streak = 1;
  let pointer = uniqueDayKeys.length - 1;
  let currentDate = latestDate;

  while (pointer > 0) {
    const previousDate = parseDayKey(uniqueDayKeys[pointer - 1]);

    if (!previousDate) {
      break;
    }

    const diff = differenceInDays(currentDate, previousDate);

    if (diff === 1) {
      streak += 1;
      currentDate = previousDate;
      pointer -= 1;
      continue;
    }

    break;
  }

  return streak;
}

function countSessionsForDay(entries: JourneySessionEntry[], dayKey: string): number {
  if (!dayKey) {
    return 0;
  }

  return entries.filter((entry) => entry.startedAt.startsWith(dayKey)).length;
}

function sumDurations(entries: JourneySessionEntry[]): number {
  return entries.reduce((total, entry) => total + (entry.durationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES), 0);
}

function sumDurationsForDay(entries: JourneySessionEntry[], dayKey: string): number {
  return entries
    .filter((entry) => entry.startedAt.startsWith(dayKey))
    .reduce((total, entry) => total + (entry.durationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES), 0);
}

function sumDurationsFrom(entries: JourneySessionEntry[], lowerBoundTime: number): number {
  return entries
    .filter((entry) => Date.parse(entry.startedAt) >= lowerBoundTime)
    .reduce((total, entry) => total + (entry.durationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES), 0);
}

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

    const orderedSessions = [...sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const lastSessionIso = orderedSessions[orderedSessions.length - 1]?.startedAt ?? null;
    const weekStart = getWeekStart(new Date());
    const weekStartTime = weekStart.getTime();

    const stepsThisWeek = orderedSessions.filter((entry) => {
      const timestamp = Date.parse(entry.startedAt);
      return !Number.isNaN(timestamp) && timestamp >= weekStartTime;
    }).length;

    const dayKeys = orderedSessions.map((entry) => entry.startedAt.slice(0, 10));
    const streakCount = calculateStreak(dayKeys);
    const todayKey = new Date().toISOString().slice(0, 10);
    const sessionsToday = countSessionsForDay(orderedSessions, todayKey);

    const minutesToday = sumDurationsForDay(orderedSessions, todayKey);
    const minutesThisWeek = sumDurationsFrom(orderedSessions, weekStartTime);
    const totalMinutes = sumDurations(orderedSessions);

    return {
      lastSessionIso,
      stepsThisWeek,
      totalSessions: orderedSessions.length,
      streakCount,
      sessionsToday,
      minutesToday,
      minutesThisWeek,
      totalMinutes,
    };
  }, [journeyId, journeys]);

  const logSession = useCallback(
    (options?: { timestamp?: Date; durationMinutes?: number }) => {
      if (!journeyId) {
        return;
      }

      const timestamp = options?.timestamp ?? new Date();
      const iso = timestamp.toISOString();
      const resolvedDuration = options?.durationMinutes;
      const durationMinutes = typeof resolvedDuration === 'number' && Number.isFinite(resolvedDuration)
        ? Math.max(0, resolvedDuration)
        : undefined;

      setJourneys((previous) => {
        const current = previous[journeyId] ?? { sessions: [] };
        const nextSessions = [...current.sessions, { startedAt: iso, durationMinutes }]
          .filter((entry) => {
            if (!entry || typeof entry.startedAt !== 'string') {
              return false;
            }

            return !Number.isNaN(Date.parse(entry.startedAt));
          })
          .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
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
  totalMinutes: number;
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
      totalMinutes: 0,
    };
  }

  const sessions = normaliseSessions(record.sessions).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const weekStart = getWeekStart(new Date()).getTime();

  return {
    lastSessionIso: sessions.length ? sessions[sessions.length - 1]?.startedAt ?? null : null,
    stepsThisWeek: sessions.filter((entry) => {
      const timestamp = Date.parse(entry.startedAt);
      return !Number.isNaN(timestamp) && timestamp >= weekStart;
    }).length,
    totalSessions: sessions.length,
    totalMinutes: sumDurations(sessions),
  };
}

export function summariseProgressForPrompt(snapshot: JourneyProgressForPrompt | null): string | null {
  if (!snapshot) {
    return null;
  }

  const lines = [
    `Steps logged this week: ${snapshot.stepsThisWeek}`,
    `Total sessions logged: ${snapshot.totalSessions}`,
    `Approximate study minutes logged: ${Math.round(snapshot.totalMinutes)}`,
  ];

  if (snapshot.lastSessionIso) {
    lines.push(`Last session timestamp (ISO): ${snapshot.lastSessionIso}`);
  } else {
    lines.push('No sessions have been logged yet.');
  }

  return lines.join('\n');
}
