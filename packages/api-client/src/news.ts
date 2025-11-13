import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import fallbackNews from '../../../data/news-fallback.json';

export type NewsItem = {
  id: string;
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  categories: string[];
  videos: string[];
  image: string | null;
};

const DEV_FIXTURE_NEWS = fallbackNews as NewsItem[];

type NewsResponse = {
  items?: NewsItem[];
};

type NewsApiConfig = {
  baseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export function getLocalNewsFeed(): NewsItem[] {
  return DEV_FIXTURE_NEWS;
}

export async function fetchNewsFeed(config: NewsApiConfig = {}): Promise<NewsItem[]> {
  const { baseUrl, fetcher = fetch, signal } = config;
  const response = await fetcher(`${normalizeBaseUrl(baseUrl)}/api/news`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch news feed (${response.status})`);
  }
  const payload = (await response.json()) as unknown;
  const items = isNewsResponse(payload) ? payload.items ?? [] : Array.isArray(payload) ? payload : [];
  return items;
}

export const newsFeedQueryKey = ['news-feed'] as const;

export type NewsFeedQueryOptions<TData = NewsItem[]> = {
  baseUrl?: string | null;
  staleTime?: number;
  enabled?: boolean;
  fetcher?: typeof fetch;
  select?: UseQueryOptions<NewsItem[], Error, TData>['select'];
};

export function useNewsFeedQuery<TData = NewsItem[]>({
  baseUrl,
  staleTime = 5 * 60_000,
  enabled,
  fetcher,
  select,
}: NewsFeedQueryOptions<TData> = {}) {
  return useQuery<NewsItem[], Error, TData>({
    queryKey: newsFeedQueryKey,
    queryFn: ({ signal }) => fetchNewsFeed({ baseUrl: baseUrl ?? undefined, signal, fetcher }),
    staleTime,
    enabled: enabled ?? Boolean(baseUrl),
    select,
  });
}

function isNewsResponse(value: unknown): value is NewsResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return 'items' in value;
}

function normalizeBaseUrl(value?: string | null): string {
  if (!value || value.trim().length === 0) {
    throw new Error('API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL to enable news headlines.');
  }
  return value.replace(/\/$/, '');
}
