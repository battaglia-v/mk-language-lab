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
  streakDays: number;
  quests: {
    active: number;
    completedThisWeek: number;
  };
  badges: ProfileBadge[];
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
};

export function useProfileSummaryQuery<TData = ProfileSummary>({
  baseUrl,
  staleTime = 5 * 60_000,
  enabled,
  fetcher,
  select,
}: ProfileSummaryQueryOptions<TData> = {}) {
  return useQuery<ProfileSummary, Error, TData>({
    queryKey: profileSummaryQueryKey,
    queryFn: ({ signal }) => fetchProfileSummary({ baseUrl: baseUrl ?? undefined, signal, fetcher }),
    staleTime,
    enabled: enabled ?? Boolean(baseUrl),
    select,
  });
}

function normalizeBaseUrl(value?: string | null): string {
  if (!value || value.trim().length === 0) {
    throw new Error('API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL to enable profile stats.');
  }
  return value.replace(/\/$/, '');
}
