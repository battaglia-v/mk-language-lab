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

const FALLBACK_NEWS = fallbackNews as NewsItem[];

type NewsApiConfig = {
  baseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export function getLocalNewsFeed(): NewsItem[] {
  return FALLBACK_NEWS;
}

export async function fetchNewsFeed(config: NewsApiConfig = {}): Promise<NewsItem[]> {
  const { baseUrl, fetcher = fetch, signal } = config;
  if (!baseUrl) {
    return FALLBACK_NEWS;
  }
  const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/api/news`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch news feed (${response.status})`);
  }
  const payload = (await response.json()) as NewsItem[];
  return payload.length ? payload : FALLBACK_NEWS;
}

export const newsFeedQueryKey = ['news-feed'] as const;

export type NewsFeedQueryOptions<TData = NewsItem[]> = {
  baseUrl?: string | null;
  staleTime?: number;
  select?: UseQueryOptions<NewsItem[], Error, TData>['select'];
};

export function useNewsFeedQuery<TData = NewsItem[]>({
  baseUrl,
  staleTime = 5 * 60_000,
  select,
}: NewsFeedQueryOptions<TData> = {}) {
  return useQuery<NewsItem[], Error, TData>({
    queryKey: newsFeedQueryKey,
    queryFn: ({ signal }) => fetchNewsFeed({ baseUrl: baseUrl ?? undefined, signal }),
    staleTime,
    select,
  });
}
