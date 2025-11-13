import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import fallbackDiscoverFeed from '../../../data/discover-feed.json';

export type DiscoverCardAccent = 'plum' | 'gold' | 'navy' | 'mint' | 'red';

export type DiscoverLinkTarget =
  | 'practice'
  | 'translator'
  | 'profile'
  | 'discover'
  | 'mission-settings'
  | 'external';

export type DiscoverCard = {
  id: string;
  title: string;
  summary: string;
  duration: string;
  cta: string;
  tag: string;
  accent: DiscoverCardAccent;
  ctaTarget?: DiscoverLinkTarget;
  ctaUrl?: string | null;
};

export type DiscoverCategory = {
  id: string;
  label: string;
  summary: string;
  cards: DiscoverCard[];
};

export type DiscoverEvent = {
  id: string;
  title: string;
  description: string;
  host: string;
  location: string;
  startAt: string;
  cta: string;
  ctaTarget?: DiscoverLinkTarget;
  ctaUrl?: string | null;
};

export type DiscoverFeed = {
  categories: DiscoverCategory[];
  events: DiscoverEvent[];
};

const FALLBACK_DISCOVER_FEED = fallbackDiscoverFeed as DiscoverFeed;

type DiscoverApiConfig = {
  baseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export function getLocalDiscoverFeed(): DiscoverFeed {
  return FALLBACK_DISCOVER_FEED;
}

export async function fetchDiscoverFeed(config: DiscoverApiConfig = {}): Promise<DiscoverFeed> {
  const { baseUrl, fetcher = fetch, signal } = config;
  const response = await fetcher(`${normalizeBaseUrl(baseUrl)}/api/discover/feed`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch discover feed (${response.status})`);
  }
  return (await response.json()) as DiscoverFeed;
}

export const discoverFeedQueryKey = ['discover-feed'] as const;

export type DiscoverFeedQueryOptions<TData = DiscoverFeed> = {
  baseUrl?: string | null;
  staleTime?: number;
  enabled?: boolean;
  fetcher?: typeof fetch;
  select?: UseQueryOptions<DiscoverFeed, Error, TData>['select'];
};

export function useDiscoverFeedQuery<TData = DiscoverFeed>({
  baseUrl,
  staleTime = 5 * 60_000,
  enabled,
  fetcher,
  select,
}: DiscoverFeedQueryOptions<TData> = {}) {
  return useQuery<DiscoverFeed, Error, TData>({
    queryKey: discoverFeedQueryKey,
    queryFn: ({ signal }) => fetchDiscoverFeed({ baseUrl: baseUrl ?? undefined, signal, fetcher }),
    staleTime,
    enabled: enabled ?? Boolean(baseUrl),
    select,
  });
}

function normalizeBaseUrl(value?: string | null): string {
  if (!value || value.trim().length === 0) {
    throw new Error('API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL to enable the Discover feed.');
  }
  return value.replace(/\/$/, '');
}
