import fallbackNews from '../../../data/news-fallback.json';

export interface Env {
  ALLOWED_ORIGIN?: string;
  NEWS_CACHE_TTL?: string;
  IMAGE_CACHE_TTL?: string;
  NEWS_FETCH_TIMEOUT_MS?: string;
  PREVIEW_FETCH_LIMIT?: string;
}

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
  {
    id: 'makfax',
    name: 'Makfax',
    feedUrl: 'https://makfax.com.mk/feed/',
    homepage: 'https://makfax.com.mk',
  },
  {
    id: 'a1on',
    name: 'A1on',
    feedUrl: 'https://a1on.mk/feed/',
    homepage: 'https://a1on.mk',
  },
] as const;

const VIDEO_URL_REGEX =
  /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[^"'\s<]+|youtu\.be\/[^"'\s<]+|facebook\.com\/[^"'\s<]+\/(?:videos|watch)[^"'\s<]*|vimeo\.com\/[^"'\s<]+))/gi;

const USER_AGENT = 'mk-language-lab-news-worker/1.0 (+https://mklanguage.com)';
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_NEWS_CACHE_TTL = 180;
const DEFAULT_IMAGE_CACHE_TTL = 60 * 60 * 24;
const DEFAULT_FETCH_TIMEOUT_MS = 15000;
const DEFAULT_PREVIEW_FETCH_LIMIT = 24;
const CONCURRENCY_LIMIT = 6;
const PREVIEW_MAX_LENGTH = 260;

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
  imageProxy?: string | null;
};

type ArticlePreviewResult = {
  preview: string | null;
  image: string | null;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type CfRequestInit = RequestInit & {
  cf?: {
    cacheTtl?: number;
    cacheEverything?: boolean;
  };
};

const FALLBACK_ITEMS: NewsItem[] = (fallbackNews as NewsItem[]) ?? [];
const previewCache = new Map<string, CacheEntry<ArticlePreviewResult>>();

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

async function getDefaultCache(): Promise<Cache> {
  const cacheStorage = caches as CacheStorage & { default?: Cache };
  if (cacheStorage.default) {
    return cacheStorage.default;
  }
  return cacheStorage.open('news-edge');
}

function getNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildImageProxyUrl(base: string, src: string): string {
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}src=${encodeURIComponent(src)}`;
}

function addCorsHeaders(headers: Headers, env: Env, request: Request) {
  const allowedOrigin = env.ALLOWED_ORIGIN ?? '*';
  headers.set('Access-Control-Allow-Origin', allowedOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  if (allowedOrigin !== '*') {
    const vary = headers.get('Vary');
    headers.set('Vary', vary ? `${vary}, Origin` : 'Origin');
  }
  const requestOrigin = request.headers.get('Origin');
  if (allowedOrigin === '*' && requestOrigin) {
    headers.set('Vary', 'Origin');
  }
}

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

      const parsed = Number.parseInt(entity, isHex ? 16 : 10);
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
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = pattern.exec(xml);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractTags(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
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
  const srcMatch = /<img[^>]+src=["']([^"']+)["'][^>]*>/i.exec(html);
  if (srcMatch) return decodeHtmlEntities(srcMatch[1]);

  const dataSrcMatch = /<img[^>]+data-src=["']([^"']+)["'][^>]*>/i.exec(html);
  if (dataSrcMatch) return decodeHtmlEntities(dataSrcMatch[1]);

  const dataLazySrcMatch = /<img[^>]+data-lazy-src=["']([^"']+)["'][^>]*>/i.exec(html);
  return dataLazySrcMatch ? decodeHtmlEntities(dataLazySrcMatch[1]) : null;
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

function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
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
    const parsedDate = pubDate ? new Date(pubDate) : null;
    const publishedAt = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString()
      : new Date().toISOString();
    const categories = extractTags(itemXml, 'category').map((category) => category.replace(/\s+/g, ' ').trim());
    const image = extractItemImage(itemXml, descriptionRaw, contentEncoded, source);

    const hashBase = `${source.id}-${link}-${title}-${publishedAt}`;
    const id = hashString(hashBase);

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
      imageProxy: null,
    });
  }

  return items;
}

function extractMetaContent(html: string, attribute: 'property' | 'name', value: string): string | null {
  const pattern1 = new RegExp(`<meta[^>]+${attribute}=["']${value}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const match1 = pattern1.exec(html);
  if (match1) return decodeHtmlEntities(match1[1]);

  const pattern2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${value}["'][^>]*>`, 'i');
  const match2 = pattern2.exec(html);
  return match2 ? decodeHtmlEntities(match2[1]) : null;
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
  return `${trimmed}...`;
}

async function fetchArticlePreview(url: string, signal: AbortSignal, timeoutMs: number): Promise<ArticlePreviewResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort, { once: true });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
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
  } finally {
    clearTimeout(timeoutId);
    signal.removeEventListener('abort', onAbort);
  }
}

function applyPreviewResult(item: NewsItem, result: ArticlePreviewResult, imageProxyBase: string) {
  if (!item.description && result.preview) {
    item.description = result.preview;
  }
  if (!item.image && result.image) {
    item.image = result.image;
    item.imageProxy = buildImageProxyUrl(imageProxyBase, result.image);
  }
}

async function enrichPreviews(
  items: NewsItem[],
  signal: AbortSignal,
  previewLimit: number,
  imageProxyBase: string,
  timeoutMs: number
): Promise<void> {
  const needEnrichment = items.filter((item) => !item.description || !item.image);
  const timeMkItems = needEnrichment.filter((item) => item.sourceId === 'time-mk');
  const otherItems = needEnrichment.filter((item) => item.sourceId !== 'time-mk');
  const candidates = [...timeMkItems, ...otherItems].slice(0, previewLimit);
  const requestCache = new Map<string, ArticlePreviewResult>();

  const tasks = candidates.map((item) => async () => {
    const cachedEntry = getCachedValue(previewCache, item.link);
    if (cachedEntry.hit) {
      requestCache.set(item.link, cachedEntry.value);
      applyPreviewResult(item, cachedEntry.value, imageProxyBase);
      return;
    }

    if (requestCache.has(item.link)) {
      applyPreviewResult(item, requestCache.get(item.link)!, imageProxyBase);
      return;
    }

    const result = await fetchArticlePreview(item.link, signal, timeoutMs);
    requestCache.set(item.link, result);
    setCachedValue(previewCache, item.link, result);
    applyPreviewResult(item, result, imageProxyBase);
  });

  await runWithConcurrency(tasks, CONCURRENCY_LIMIT);
}

async function fetchFeed(source: NewsSource, signal: AbortSignal): Promise<NewsItem[]> {
  const response = await fetch(source.feedUrl, {
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

function isPrivateHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower.endsWith('.local') || lower === '0.0.0.0' || lower === '::1') {
    return true;
  }

  if (lower.includes(':')) {
    return lower.startsWith('fd') || lower.startsWith('fc') || lower.startsWith('fe80');
  }

  const ipv4Match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(lower);
  if (!ipv4Match) {
    return false;
  }

  const octets = ipv4Match.slice(1).map((part) => Number.parseInt(part, 10));
  if (octets.some((octet) => Number.isNaN(octet) || octet > 255)) {
    return false;
  }

  if (octets[0] === 10 || octets[0] === 127) {
    return true;
  }
  if (octets[0] === 192 && octets[1] === 168) {
    return true;
  }
  return octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31;
}

function normalizeProxyTarget(raw: string, requestUrl: URL): string | null {
  const decoded = raw;
  let targetUrl: URL;

  try {
    targetUrl = new URL(decoded);
  } catch {
    if (decoded.startsWith('//')) {
      targetUrl = new URL(`https:${decoded}`);
    } else {
      return null;
    }
  }

  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return null;
  }

  if (targetUrl.hostname === requestUrl.hostname) {
    const nested = targetUrl.searchParams.get('src');
    if (nested && nested !== raw) {
      return normalizeProxyTarget(nested, requestUrl);
    }
    return null;
  }

  if (isPrivateHostname(targetUrl.hostname)) {
    return null;
  }

  return targetUrl.toString();
}

async function handleImageRequest(request: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const srcParam = url.searchParams.get('src');
  const headers = new Headers();
  addCorsHeaders(headers, env, request);

  if (!srcParam) {
    return new Response('Missing src parameter.', { status: 400, headers });
  }

  const normalizedTarget = normalizeProxyTarget(srcParam, url);
  if (!normalizedTarget) {
    return new Response('Invalid src parameter.', { status: 400, headers });
  }

  const cache = await getDefaultCache();
  const cacheKey = new Request(url.toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const imageCacheTtl = getNumber(env.IMAGE_CACHE_TTL, DEFAULT_IMAGE_CACHE_TTL);
  const response = await fetch(normalizedTarget, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
      Referer: new URL(normalizedTarget).origin,
    },
    cf: {
      cacheTtl: imageCacheTtl,
      cacheEverything: true,
    },
  } as CfRequestInit);

  if (!response.ok) {
    return new Response('Unable to fetch image.', { status: 502, headers });
  }

  const proxyHeaders = new Headers(response.headers);
  proxyHeaders.delete('set-cookie');
  proxyHeaders.set('Cache-Control', `public, max-age=${imageCacheTtl}, s-maxage=${imageCacheTtl}`);
  addCorsHeaders(proxyHeaders, env, request);

  const proxyResponse = new Response(response.body, {
    status: response.status,
    headers: proxyHeaders,
  });

  ctx.waitUntil(cache.put(cacheKey, proxyResponse.clone()));
  return proxyResponse;
}

async function handleNewsRequest(request: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const cache = await getDefaultCache();
  const cacheKey = new Request(url.toString(), request);
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const sourceParam = (url.searchParams.get('source') ?? 'all').toLowerCase();
  const query = url.searchParams.get('q')?.trim().toLowerCase() ?? '';
  const limitParam = Number.parseInt(url.searchParams.get('limit') ?? '', 10);
  const videosOnly = url.searchParams.get('videosOnly') === 'true';
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 50)) : 30;

  const selectedSources =
    sourceParam === 'all'
      ? [...NEWS_SOURCES]
      : NEWS_SOURCES.filter((source) => source.id === sourceParam);

  if (selectedSources.length === 0) {
    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
    addCorsHeaders(headers, env, request);
    return new Response(
      JSON.stringify({
        items: [],
        meta: {
          count: 0,
          total: 0,
          fetchedAt: new Date().toISOString(),
          errors: [`Unknown source: ${sourceParam}`],
        },
        sources: NEWS_SOURCES,
      }),
      { status: 400, headers }
    );
  }

  const fetchTimeoutMs = getNumber(env.NEWS_FETCH_TIMEOUT_MS, DEFAULT_FETCH_TIMEOUT_MS);
  const previewLimit = getNumber(env.PREVIEW_FETCH_LIMIT, DEFAULT_PREVIEW_FETCH_LIMIT);
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), fetchTimeoutMs);
  const errors: string[] = [];

  try {
    const results = await Promise.all(
      selectedSources.map(async (source) => {
        try {
          const items = await fetchFeed(source, abortController.signal);
          return { source, items };
        } catch (error) {
          const errorMessage = (error as Error).name === 'AbortError'
            ? `${source.name}: Request timed out`
            : (error as Error).message;
          return { source, items: [], error: errorMessage };
        }
      })
    );

    errors.push(
      ...results.map((result) => result.error).filter((message): message is string => Boolean(message))
    );

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
    const payloadItems = (limitedItems.length > 0 ? limitedItems : FALLBACK_ITEMS).map((item) => ({ ...item }));
    const imageProxyBase = new URL('/api/news/image', request.url).toString();

    payloadItems.forEach((item) => {
      if (item.image) {
        item.imageProxy = buildImageProxyUrl(imageProxyBase, item.image);
      }
    });

    try {
      await enrichPreviews(payloadItems, abortController.signal, previewLimit, imageProxyBase, 6000);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        errors.push('Preview enrichment failed.');
      }
    }

    const newsCacheTtl = getNumber(env.NEWS_CACHE_TTL, DEFAULT_NEWS_CACHE_TTL);
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, s-maxage=${newsCacheTtl}, stale-while-revalidate=${newsCacheTtl * 2}`,
    });
    addCorsHeaders(headers, env, request);

    const response = new Response(
      JSON.stringify({
        items: payloadItems,
        meta: {
          count: payloadItems.length,
          total: combinedItems.length,
          fetchedAt: new Date().toISOString(),
          errors,
        },
        sources: NEWS_SOURCES,
      }),
      { headers }
    );

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    const newsCacheTtl = getNumber(env.NEWS_CACHE_TTL, DEFAULT_NEWS_CACHE_TTL);
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, s-maxage=${newsCacheTtl}, stale-while-revalidate=${newsCacheTtl * 2}`,
    });
    addCorsHeaders(headers, env, request);
    return new Response(
      JSON.stringify({
        items: FALLBACK_ITEMS,
        meta: {
          count: FALLBACK_ITEMS.length,
          total: FALLBACK_ITEMS.length,
          fetchedAt: new Date().toISOString(),
          errors: [(error as Error).message || 'Failed to fetch news'],
        },
        sources: NEWS_SOURCES,
      }),
      { headers }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') {
      const headers = new Headers();
      addCorsHeaders(headers, env, request);
      return new Response(null, { status: 204, headers });
    }

    const isImagePath = pathname.startsWith('/image') || pathname.startsWith('/api/news/image');
    if (isImagePath) {
      if (request.method !== 'GET') {
        const headers = new Headers();
        addCorsHeaders(headers, env, request);
        return new Response('Method not allowed.', { status: 405, headers });
      }
      return handleImageRequest(request, env, ctx);
    }

    const isNewsPath = pathname === '/' || pathname.startsWith('/news') || pathname.startsWith('/api/news');
    if (!isNewsPath) {
      const headers = new Headers();
      addCorsHeaders(headers, env, request);
      return new Response('Not found.', { status: 404, headers });
    }

    if (request.method !== 'GET') {
      const headers = new Headers();
      addCorsHeaders(headers, env, request);
      return new Response('Method not allowed.', { status: 405, headers });
    }

    return handleNewsRequest(request, env, ctx);
  },
};
