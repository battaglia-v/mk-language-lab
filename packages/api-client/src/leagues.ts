import { useQuery } from '@tanstack/react-query';
import fallbackStandings from '../../../data/league-standings.json';

export type LeagueMember = {
  id: string;
  name: string;
  rank: number;
  streakDays: number;
  xp: number;
  avatarUrl: string | null;
  trend?: 'up' | 'down' | 'neutral';
  isCurrentUser?: boolean;
};

export type LeagueStandings = {
  tier: string;
  tierLabel: string;
  icon?: string | null;
  rank: number | null;
  streakDays: number;
  promotionCutoff: number;
  demotionCutoff: number | null;
  progressPercent: number;
  updatedAt: string;
  members: LeagueMember[];
};

const DEV_FIXTURE_STANDINGS = fallbackStandings as LeagueStandings;

export type LeagueStandingsQueryOptions<TData = LeagueStandings> = {
  baseUrl?: string | null;
  staleTime?: number;
  enabled?: boolean;
  select?: (data: LeagueStandings) => TData;
  fetcher?: typeof fetch;
};

export async function fetchLeagueStandings({
  baseUrl,
  signal,
  fetcher = fetch,
}: {
  baseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
} = {}): Promise<LeagueStandings> {
  const url = `${normalizeBaseUrl(baseUrl)}/api/leagues/standings`;
  const response = await fetcher(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch league standings (${response.status})`);
  }
  return (await response.json()) as LeagueStandings;
}

export function useLeagueStandingsQuery<TData = LeagueStandings>({
  baseUrl,
  staleTime = 5 * 60_000,
  enabled,
  select,
  fetcher,
}: LeagueStandingsQueryOptions<TData> = {}) {
  return useQuery<LeagueStandings, Error, TData>({
    queryKey: ['league-standings'],
    queryFn: ({ signal }) => fetchLeagueStandings({ baseUrl: baseUrl ?? undefined, signal, fetcher }),
    staleTime,
    enabled: enabled ?? true,
    select,
    // Only use fixture data in development/testing, not in production
    initialData: process.env.NODE_ENV === 'development' && !baseUrl ? DEV_FIXTURE_STANDINGS : undefined,
  });
}

export function getLocalLeagueStandings(): LeagueStandings {
  return DEV_FIXTURE_STANDINGS;
}

function normalizeBaseUrl(value?: string | null): string {
  if (!value || value.trim().length === 0) {
    return '';
  }
  return value.replace(/\/$/, '');
}
