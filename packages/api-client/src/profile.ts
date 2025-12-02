import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import fallbackProfileSummary from '../../../data/profile-summary.json';

export type ProfileBadge = {
  id: string;
  label: string;
  description: string;
  earnedAt: string | null;
};

export type ProfileSummary = {
  name: string;
  level: string;
  xp: {
    total: number;
    weekly: number;
  };
  xpProgress: {
    percentComplete: number;
    xpInCurrentLevel: number;
    xpForNextLevel: number;
  };
  streakDays: number;
  quests: {
    active: number;
    completedThisWeek: number;
  };
  hearts: {
    current: number;
    max: number;
    minutesUntilNext: number;
    isFull: boolean;
  };
  currency: {
    gems: number;
    coins: number;
  };
  league: {
    tier: string;
    nextTier?: string | null;
    daysUntilNextTier?: number | null;
  };
  badges: ProfileBadge[];
  activityHeatmap: Array<{
    date: string;
    xp: number;
    practiceMinutes: number;
    status: 'complete' | 'partial' | 'missed';
  }>;
};

const DEV_FIXTURE_PROFILE = fallbackProfileSummary as ProfileSummary;

type ProfileApiConfig = {
  baseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export function getLocalProfileSummary(): ProfileSummary {
  return DEV_FIXTURE_PROFILE;
}

export async function fetchProfileSummary(config: ProfileApiConfig = {}): Promise<ProfileSummary> {
  const { baseUrl, fetcher = fetch, signal } = config;
  const response = await fetcher(`${normalizeBaseUrl(baseUrl)}/api/profile/summary`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch profile summary (${response.status})`);
  }
  return (await response.json()) as ProfileSummary;
}

export const profileSummaryQueryKey = ['profile-summary'] as const;

export type ProfileSummaryQueryOptions<TData = ProfileSummary> = {
  baseUrl?: string | null;
  staleTime?: number;
  enabled?: boolean;
  fetcher?: typeof fetch;
  select?: UseQueryOptions<ProfileSummary, Error, TData>['select'];
  /**
   * Opt into using local fixtures as initial data. Disabled by default so
   * authenticated users do not see placeholder accounts.
   */
  useFixtures?: boolean;
};

export function useProfileSummaryQuery<TData = ProfileSummary>({
  baseUrl,
  staleTime = 5 * 60_000,
  enabled,
  fetcher,
  select,
  useFixtures = false,
}: ProfileSummaryQueryOptions<TData> = {}) {
  return useQuery<ProfileSummary, Error, TData>({
    queryKey: profileSummaryQueryKey,
    queryFn: ({ signal }) => fetchProfileSummary({ baseUrl: baseUrl ?? undefined, signal, fetcher }),
    staleTime,
    enabled: enabled ?? true,
    select,
    initialData: useFixtures ? getLocalProfileSummary() : undefined,
    retry: (failureCount, error: any) => {
      // Don't retry auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      // Retry up to 3 times for other errors (including 503)
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff: 1s, 2s, 4s (max 10s)
  });
}

function normalizeBaseUrl(value?: string | null): string {
  if (!value || value.trim().length === 0) {
    return '';
  }
  return value.replace(/\/$/, '');
}
