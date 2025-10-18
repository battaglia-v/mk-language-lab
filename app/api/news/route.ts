import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const NEWS_SOURCES = [
  {
    id: 'time-mk',
    name: 'Time.mk',
    feedUrl: 'https://time.mk/rss/all',
    homepage: 'https://time.mk',
  },
  {
    id: 'grid-mk',
    name: 'Grid.mk',
    feedUrl: 'https://grid.mk/rss',
    homepage: 'https://grid.mk',
  },
] as const;

const VIDEO_URL_REGEX = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[^"'\s<]+|youtu\.be\/[^"'\s<]+|facebook\.com\/[^"'\s<]+\/(?:videos|watch)[^"'\s<]*|vimeo\.com\/[^"'\s<]+))/gi;

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
  },
  {
    id: 'fallback-grid-1',
    title: 'Проверете ги најновите вести на Grid.mk',
    link: 'https://grid.mk',
    description: 'Пример објава додека се вчитуваат вистинските вести од Grid.mk.',
    publishedAt: new Date().toISOString(),
    sourceId: 'grid-mk',
    sourceName: 'Grid.mk',
    categories: ['placeholder'],
    videos: [],
  },
];

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
  const pattern = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
  const match = pattern.exec(xml);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractTags(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'gi');
  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(xml)) !== null) {
    matches.push(decodeHtmlEntities(match[1].trim()));
  }

  return matches;
}

function parseFeed(xml: string, source: NewsSource): NewsItem[] {
  const items: NewsItem[] = [];
  const itemPattern = /<item[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemPattern.exec(xml)) !== null) {
    const itemXml = match[0];
    const title = extractTag(itemXml, 'title') ?? 'Untitled';
    const link = extractTag(itemXml, 'link') ?? source.homepage;
    const descriptionRaw = extractTag(itemXml, 'description') ?? '';
    const pubDate = extractTag(itemXml, 'pubDate') ?? extractTag(itemXml, 'dc:date');
    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const categories = extractTags(itemXml, 'category').map((category) => category.replace(/\s+/g, ' ').trim());

    const hashBase = `${source.id}-${link}-${title}-${publishedAt}`;
    const id = crypto.createHash('md5').update(hashBase).digest('hex');

  const combinedText = `${itemXml}\n${link}\n${descriptionRaw}`;
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
    });
  }

  return items;
}

async function fetchFeed(source: NewsSource, signal: AbortSignal): Promise<NewsItem[]> {
  const response = await fetch(source.feedUrl, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'mk-language-lab/1.0 (+https://github.com/battaglia-v/mk-language-lab)',
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

    const payloadItems = limitedItems.length > 0 ? limitedItems : FALLBACK_ITEMS;

    return NextResponse.json({
      items: payloadItems,
      meta: {
        count: payloadItems.length,
        total: combinedItems.length,
        fetchedAt: new Date().toISOString(),
        errors,
      },
      sources: NEWS_SOURCES,
    });
  } finally {
    clearTimeout(timeout);
  }
}
