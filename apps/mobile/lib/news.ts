/**
 * News API client for mobile app
 * 
 * Fetches Macedonian news from various sources
 * Supports filtering by source, search, and video-only
 * 
 * @see app/api/news/route.ts (PWA API)
 * @see app/[locale]/news/NewsClient.tsx (PWA implementation)
 */

import { apiFetch } from './api';

export type NewsSource = 'all' | 'time-mk' | 'meta-mk' | 'makfax' | 'a1on';

export interface NewsItem {
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
  imageProxy?: string | null;
}

export interface NewsMeta {
  count: number;
  total: number;
  fetchedAt: string;
  errors?: string[];
}

export interface NewsResponse {
  items: NewsItem[];
  meta: NewsMeta;
}

export interface NewsFilters {
  source?: NewsSource;
  query?: string;
  videosOnly?: boolean;
  limit?: number;
}

const API_BASE = 'https://mk-language-lab.vercel.app';

/**
 * Fetch news articles from the API
 */
export async function fetchNews(filters: NewsFilters = {}): Promise<NewsResponse> {
  const params = new URLSearchParams();
  
  if (filters.source && filters.source !== 'all') {
    params.set('source', filters.source);
  }
  if (filters.query?.trim()) {
    params.set('q', filters.query.trim());
  }
  if (filters.videosOnly) {
    params.set('videosOnly', 'true');
  }
  params.set('limit', String(filters.limit || 30));

  const queryString = params.toString();
  const url = `${API_BASE}/api/news${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      items: Array.isArray(data.items) ? data.items : [],
      meta: data.meta || { count: 0, total: 0, fetchedAt: new Date().toISOString() },
    };
  } catch (error) {
    console.error('[News] Failed to fetch:', error);
    return {
      items: [],
      meta: { count: 0, total: 0, fetchedAt: new Date().toISOString(), errors: [(error as Error).message] },
    };
  }
}

/**
 * Get source display info
 */
export function getSourceInfo(sourceId: string): { name: string; color: string } {
  const sources: Record<string, { name: string; color: string }> = {
    'time-mk': { name: 'Time.mk', color: '#dc2626' },
    'meta-mk': { name: 'Meta.mk', color: '#2563eb' },
    'makfax': { name: 'Makfax', color: '#16a34a' },
    'a1on': { name: 'A1on', color: '#9333ea' },
  };
  return sources[sourceId] || { name: sourceId, color: '#6b7280' };
}

/**
 * Format relative time for news articles
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('mk-MK', { 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Extract plain text from HTML description
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
