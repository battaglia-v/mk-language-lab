import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { newsRateLimit, checkRateLimit } from '@/lib/rate-limit';

export const revalidate = 180;

const NEWS_SOURCES = [
  {
    id: 'time-mk',
    name: 'Time.mk',
    feedUrl: 'https://time.mk/rss/all',
    homepage: 'https://time.mk',
  },
  {
    id: 'meta-mk',
    name: 'Meta.mk',
    feedUrl: 'https://meta.mk/feed/',
    homepage: 'https://meta.mk',
  },
] as const;

const VIDEO_URL_REGEX = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[^"'\s<]+|youtu\.be\/[^"'\s<]+|facebook\.com\/[^"'\s<]+\/(?:videos|watch)[^"'\s<]*|vimeo\.com\/[^"'\s<]+))/gi;

const USER_AGENT = 'mk-language-lab/1.0 (+https://github.com/battaglia-v/mk-language-lab)';
const CACHE_TTL_MS = 5 * 60 * 1000;
const CONCURRENCY_LIMIT = 4;

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

type NewsSource = (typeof NEWS_SOURCES)[number];

type NewsItem = {
  id: string;
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  sourceId: NewsSource['id'];
  sourceName: NewsSource['name'];
  categories: string[];
  videos: string[];
  image: string | null;
};

type ArticlePreviewResult = {
  preview: string | null;
  image: string | null;
};

const FALLBACK_ITEMS: NewsItem[] = [
  {
    id: 'fallback-time-1',
    title: 'Добредојдовте во новиот македонски јазичен лабораториум',
    link: 'https://time.mk',
    description: 'Пример објава додека се вчитуваат вистинските вести од Time.mk.',
    publishedAt: new Date().toISOString(),
    sourceId: 'time-mk',
    sourceName: 'Time.mk',
    categories: ['placeholder'],
    videos: [],
    image: null,
  },
  {
    id: 'fallback-meta-1',
    title: 'Проверете ги најновите вести на Meta.mk',
    link: 'https://meta.mk',
    description: 'Пример објава додека се вчитуваат вистинските вести од Meta.mk.',
    publishedAt: new Date().toISOString(),
    sourceId: 'meta-mk',
    sourceName: 'Meta.mk',
    categories: ['placeholder'],
    videos: [],
    image: null,
  },
];

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const linkResolutionCache = new Map<string, CacheEntry<string | null>>();
const previewCache = new Map<string, CacheEntry<ArticlePreviewResult>>();

function getCachedValue<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): { hit: true; value: T } | { hit: false } {
  const entry = cache.get(key);
  if (!entry) {
    return { hit: false };
  }

  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return { hit: false };
  }

  return { hit: true, value: entry.value };
}

function setCachedValue<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

async function runWithConcurrency(tasks: Array<() => Promise<void>>, limit: number): Promise<void> {
  if (tasks.length === 0) {
    return;
  }

  const workerCount = Math.max(1, Math.min(limit, tasks.length));
  let index = 0;

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = index;
      if (currentIndex >= tasks.length) {
        break;
      }
      index += 1;
      await tasks[currentIndex]();
    }
  });

  await Promise.all(workers);
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&(#?)(x?)(\w+);/g, (_, isNumeric: string, isHex: string, entity: string) => {
      if (!isNumeric) {
        return HTML_ENTITIES[entity] ?? `&${entity};`;
      }

      const parsed = parseInt(entity, isHex ? 16 : 10);
      if (Number.isNaN(parsed)) {
        return `&${isNumeric}${isHex}${entity};`;
      }

      return String.fromCodePoint(parsed);
    })
    .replace(/\s+/g, ' ')
    .trim();
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractTag(xml: string, tag: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
  const match = pattern.exec(xml);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractTags(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'gi');
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(xml)) !== null) {
    matches.push(decodeHtmlEntities(match[1].trim()));
  }

  return matches;
}

function extractAttributeValue(xml: string, tag: string, attribute: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]+${attribute}=["']([^"']+)["'][^>]*>`, 'i');
  const match = pattern.exec(xml);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function isValidHttpUrl(value: string | null | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function normalizePotentialUrl(value: string | null, base?: string): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || /^data:/i.test(trimmed)) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  if (base) {
    try {
      return new URL(trimmed, base).href;
    } catch {
      return null;
    }
  }

  return null;
}

function extractFirstImageSource(html: string): string | null {
  const match = /<img[^>]+src=["']([^"']+)["'][^>]*>/i.exec(html);
  return match ? decodeHtmlEntities(match[1]) : null;
}

function extractItemImage(
  itemXml: string,
  descriptionRaw: string,
  contentEncoded: string,
  source: NewsSource
): string | null {
  const mediaCandidates = [
    extractAttributeValue(itemXml, 'media:content', 'url'),
    extractAttributeValue(itemXml, 'media:thumbnail', 'url'),
    extractAttributeValue(itemXml, 'enclosure', 'url'),
  ];

  for (const candidate of mediaCandidates) {
    const normalized = normalizePotentialUrl(candidate, source.homepage);
    if (normalized) {
      return normalized;
    }
  }

  for (const fragment of [contentEncoded, descriptionRaw]) {
    if (!fragment) {
      continue;
    }
    const imageCandidate = extractFirstImageSource(fragment);
    const normalized = normalizePotentialUrl(imageCandidate, source.homepage);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function resolveItemLink(
  itemXml: string,
  source: NewsSource,
  descriptionRaw: string,
  contentEncoded: string
): string {
  const candidates = new Set<string>();

  const addCandidate = (value: string | null | undefined) => {
    if (isValidHttpUrl(value)) {
      candidates.add(decodeHtmlEntities(value));
    }
  };

  addCandidate(extractTag(itemXml, 'link'));
  addCandidate(extractAttributeValue(itemXml, 'link', 'href'));
  addCandidate(extractTag(itemXml, 'guid'));
  addCandidate(extractTag(itemXml, 'feedburner:origlink'));
  addCandidate(extractTag(itemXml, 'feedburner:origLink'));
  addCandidate(extractAttributeValue(itemXml, 'atom:link', 'href'));
  addCandidate(extractTag(itemXml, 'atom:link'));
  addCandidate(extractTag(itemXml, 'dc:identifier'));
  addCandidate(extractTag(itemXml, 'meta:origlink'));
  addCandidate(extractTag(itemXml, 'ht:news_url'));

  const combinedDescriptions = [descriptionRaw, contentEncoded].filter(Boolean).join('\n');

  const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  let anchorMatch: RegExpExecArray | null;
  while ((anchorMatch = anchorRegex.exec(combinedDescriptions)) !== null) {
    addCandidate(anchorMatch[1]);
  }

  const rawUrlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  let rawMatch: RegExpExecArray | null;
  while ((rawMatch = rawUrlRegex.exec(combinedDescriptions)) !== null) {
    addCandidate(rawMatch[1]);
  }

  if (candidates.size === 0) {
    return source.homepage;
  }

  const homepageUrl = (() => {
    try {
      return new URL(source.homepage);
    } catch {
      return null;
    }
  })();

  const preferred = [...candidates].find((candidate) => {
    try {
      if (!homepageUrl) {
        return true;
      }

      const candidateUrl = new URL(candidate);
      const sameHost = candidateUrl.host === homepageUrl.host;
      const normalizedPath = candidateUrl.pathname.replace(/\/+/g, '/').replace(/\/$/, '');
      if (!sameHost) {
        return true;
      }
      return normalizedPath !== '' && normalizedPath !== '/';
    } catch {
      return true;
    }
  });

  return preferred ?? [...candidates][0];
}

const TIME_MK_HOSTS = new Set(['time.mk', 'www.time.mk']);

async function resolveTimeMkLink(url: URL, signal: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch(url.href, {
      cache: 'no-store',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      signal,
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const redirectMatch =
      /href=["']((?:https?:\/\/time\.mk)?\/?r\/[a-z]\/[^"]+?\/?)["']/i.exec(html) ??
      /href=["'](\/?r\/[a-z]\/[^"]+?\/?)["']/i.exec(html);

    if (!redirectMatch) {
      return null;
    }

    const redirectUrl = new URL(redirectMatch[1], url.origin).href;
    const redirectResponse = await fetch(redirectUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'manual',
      signal,
    });

    if (redirectResponse.status >= 300 && redirectResponse.status < 400) {
      const location = redirectResponse.headers.get('location');
      if (location) {
        try {
          return new URL(location, redirectUrl).href;
        } catch {
          return null;
        }
      }
    }

    return redirectUrl;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error;
    }
    return null;
  }
}

async function resolveExternalLinks(items: NewsItem[], signal: AbortSignal): Promise<void> {
  const requestCache = new Map<string, string | null>();

  const tasks = items.map((item) => async () => {
    const originalLink = item.link;

    if (requestCache.has(originalLink)) {
      const cachedValue = requestCache.get(originalLink);
      if (cachedValue) {
        item.link = cachedValue;
      }
      return;
    }

    const cachedEntry = getCachedValue(linkResolutionCache, originalLink);
    if (cachedEntry.hit) {
      requestCache.set(originalLink, cachedEntry.value);
      if (cachedEntry.value) {
        item.link = cachedEntry.value;
      }
      return;
    }

    let resolved: string | null = null;

    try {
      const parsed = new URL(originalLink);
      if (TIME_MK_HOSTS.has(parsed.hostname) && parsed.pathname.startsWith('/c/')) {
        resolved = await resolveTimeMkLink(parsed, signal);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw error;
      }
    }

    requestCache.set(originalLink, resolved);
    setCachedValue(linkResolutionCache, originalLink, resolved);

    if (resolved) {
      item.link = resolved;
    }
  });

  await runWithConcurrency(tasks, CONCURRENCY_LIMIT);
}

function parseFeed(xml: string, source: NewsSource): NewsItem[] {
  const items: NewsItem[] = [];
  const itemPattern = /<item[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemPattern.exec(xml)) !== null) {
    const itemXml = match[0];
    const title = extractTag(itemXml, 'title') ?? 'Untitled';
    const descriptionRaw = extractTag(itemXml, 'description') ?? '';
    const contentEncoded = extractTag(itemXml, 'content:encoded') ?? '';
    const link = resolveItemLink(itemXml, source, descriptionRaw, contentEncoded);
    const pubDate = extractTag(itemXml, 'pubDate') ?? extractTag(itemXml, 'dc:date');
    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const categories = extractTags(itemXml, 'category').map((category) => category.replace(/\s+/g, ' ').trim());
    const image = extractItemImage(itemXml, descriptionRaw, contentEncoded, source);

    const hashBase = `${source.id}-${link}-${title}-${publishedAt}`;
    const id = crypto.createHash('md5').update(hashBase).digest('hex');

    const combinedText = `${itemXml}\n${link}\n${descriptionRaw}\n${contentEncoded}`;
    const videosSet = new Set<string>();
    let videoMatch: RegExpExecArray | null;
    const videoRegex = new RegExp(VIDEO_URL_REGEX.source, VIDEO_URL_REGEX.flags);
    while ((videoMatch = videoRegex.exec(combinedText)) !== null) {
      const url = decodeHtmlEntities(videoMatch[1]);
      videosSet.add(url);
    }

    items.push({
      id,
      title,
      link,
      description: stripTags(descriptionRaw),
      publishedAt,
      sourceId: source.id,
      sourceName: source.name,
      categories,
      videos: Array.from(videosSet),
      image,
    });
  }

  return items;
}

const PREVIEW_FETCH_LIMIT = 10;
const PREVIEW_MAX_LENGTH = 260;

function extractMetaContent(html: string, attribute: 'property' | 'name', value: string): string | null {
  const pattern = new RegExp(`<meta[^>]+${attribute}=["']${value}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const match = pattern.exec(html);
  return match ? decodeHtmlEntities(match[1]) : null;
}

function extractSnippetParagraph(html: string): string | null {
  const snippetMatch = /<p[^>]*class=["'][^"']*snippet[^"']*["'][^>]*>([\s\S]*?)<\/p>/i.exec(html);
  if (snippetMatch) {
    return snippetMatch[1];
  }

  const firstParagraphMatch = /<p>([\s\S]*?)<\/p>/i.exec(html);
  return firstParagraphMatch ? firstParagraphMatch[1] : null;
}

function truncatePreview(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const slice = text.slice(0, maxLength).replace(/[\s\u00A0]+$/u, '');
  const lastSpace = slice.lastIndexOf(' ');
  const trimmed = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed}…`;
}

async function fetchArticlePreview(url: string, signal: AbortSignal): Promise<ArticlePreviewResult> {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      signal,
    });

    if (!response.ok) {
      return { preview: null, image: null };
    }

    const finalUrl = response.url;
    const html = await response.text();
    const rawPreview =
      extractMetaContent(html, 'property', 'og:description') ??
      extractMetaContent(html, 'name', 'description') ??
      extractSnippetParagraph(html);

    const previewText = rawPreview ? stripTags(rawPreview) : null;
    const preview = previewText ? truncatePreview(previewText, PREVIEW_MAX_LENGTH) : null;

    const imageCandidate =
      extractMetaContent(html, 'property', 'og:image') ??
      extractMetaContent(html, 'name', 'twitter:image') ??
      extractFirstImageSource(html);
    const image = normalizePotentialUrl(imageCandidate, finalUrl);

    return { preview, image };
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return { preview: null, image: null };
    }
    return { preview: null, image: null };
  }
}

async function enrichPreviews(items: NewsItem[], signal: AbortSignal): Promise<void> {
  const candidates = items.filter((item) => !(item.description && item.image)).slice(0, PREVIEW_FETCH_LIMIT);
  const requestCache = new Map<string, ArticlePreviewResult>();

  const tasks = candidates.map((item) => async () => {
    const cachedEntry = getCachedValue(previewCache, item.link);
    if (cachedEntry.hit) {
      requestCache.set(item.link, cachedEntry.value);
      applyPreviewResult(item, cachedEntry.value);
      return;
    }

    if (requestCache.has(item.link)) {
      applyPreviewResult(item, requestCache.get(item.link)!);
      return;
    }

    const result = await fetchArticlePreview(item.link, signal);
    requestCache.set(item.link, result);
    setCachedValue(previewCache, item.link, result);
    applyPreviewResult(item, result);
  });

  await runWithConcurrency(tasks, CONCURRENCY_LIMIT);
}

function applyPreviewResult(item: NewsItem, result: ArticlePreviewResult) {
  if (!item.description && result.preview) {
    item.description = result.preview;
  }
  if (!item.image && result.image) {
    item.image = result.image;
  }
}

async function fetchFeed(source: NewsSource, signal: AbortSignal): Promise<NewsItem[]> {
  const response = await fetch(source.feedUrl, {
    cache: 'no-store',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
      },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name} feed (${response.status})`);
  }

  const xml = await response.text();
  return parseFeed(xml, source);
}

export async function GET(request: NextRequest) {
  // Rate limiting - prevent scraping abuse
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
  const { success, limit: rateLimitMax, reset, remaining } = await checkRateLimit(newsRateLimit, ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitMax.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        }
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const sourceParam = (searchParams.get('source') ?? 'all').toLowerCase();
  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '', 10);
  const videosOnly = searchParams.get('videosOnly') === 'true';
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 50)) : 30;

  const selectedSources =
    sourceParam === 'all'
      ? [...NEWS_SOURCES]
      : NEWS_SOURCES.filter((source) => source.id === sourceParam);

  if (selectedSources.length === 0) {
    return NextResponse.json(
      {
        items: [],
        meta: {
          count: 0,
          total: 0,
          fetchedAt: new Date().toISOString(),
          errors: [`Unknown source: ${sourceParam}`],
        },
        sources: NEWS_SOURCES,
      },
      { status: 400 }
    );
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 8000);

  try {
    const results = await Promise.all(
      selectedSources.map(async (source) => {
        try {
          const items = await fetchFeed(source, abortController.signal);
          return { source, items };
        } catch (error) {
          return { source, items: [], error: (error as Error).message };
        }
      })
    );

    const errors = results
      .map((result) => result.error)
      .filter((message): message is string => Boolean(message));

    let combinedItems = results.flatMap((result) => result.items);

    if (query) {
      combinedItems = combinedItems.filter((item) => {
        const haystack = `${item.title}\n${item.description}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    if (videosOnly) {
      combinedItems = combinedItems.filter((item) => item.videos.length > 0);
    }

    combinedItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const limitedItems = combinedItems.slice(0, limit);

    // Skip slow link resolution for faster initial load
    // Time.mk links will still work, just won't be fully resolved
    // if (limitedItems.length > 0) {
    //   await resolveExternalLinks(limitedItems, abortController.signal);
    // }

    const payloadItems = (limitedItems.length > 0 ? limitedItems : FALLBACK_ITEMS).map((item) => ({ ...item }));

    await enrichPreviews(payloadItems, abortController.signal);

    return NextResponse.json(
      {
        items: payloadItems,
        meta: {
          count: payloadItems.length,
          total: combinedItems.length,
          fetchedAt: new Date().toISOString(),
          errors,
        },
        sources: NEWS_SOURCES,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=300',
        },
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}
