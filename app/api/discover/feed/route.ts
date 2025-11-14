import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fallbackDiscoverFeed from '@/data/discover-feed.json';
import type { DiscoverFeed, DiscoverCardAccent } from '@mk/api-client';

export const revalidate = 300;

const FALLBACK_FEED = fallbackDiscoverFeed as DiscoverFeed;
const CARD_ACCENTS: DiscoverCardAccent[] = ['plum', 'gold', 'navy', 'mint', 'red'];

export async function GET() {
  try {
    const [modules, upcomingWords] = await Promise.all([
      prisma.module.findMany({
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            take: 5,
          },
        },
        orderBy: [{ journeyId: 'asc' }, { orderIndex: 'asc' }],
      }),
      prisma.wordOfTheDay.findMany({
        where: {
          isActive: true,
          scheduledDate: {
            gte: startOfDay(new Date()),
          },
        },
        orderBy: { scheduledDate: 'asc' },
        take: 4,
      }),
    ]);

    const builtCategories = buildCategories(modules);
    const builtEvents = buildEvents(upcomingWords);

    if (!builtCategories.length && !builtEvents.length) {
      throw new Error('No discover content available');
    }

    const payload: DiscoverFeed = {
      categories: builtCategories.length ? builtCategories : FALLBACK_FEED.categories,
      events: builtEvents.length ? builtEvents : FALLBACK_FEED.events,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        'x-discover-source': 'prisma',
      },
    });
  } catch (error) {
    console.error('[api.discover.feed] Falling back to static feed', error);
    return NextResponse.json(FALLBACK_FEED, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'x-discover-source': 'fallback',
      },
    });
  }
}

type ModuleWithLessons = Awaited<ReturnType<typeof prisma.module.findMany<{
  include: { lessons: true };
}>>>[number];

type WordRecord = Awaited<ReturnType<typeof prisma.wordOfTheDay.findMany>>[number];

function buildCategories(modules: ModuleWithLessons[]): DiscoverFeed['categories'] {
  const grouped = new Map<string, ModuleWithLessons[]>();
  modules.forEach((module) => {
    const bucket = grouped.get(module.journeyId) ?? [];
    bucket.push(module);
    grouped.set(module.journeyId, bucket);
  });

  const categories: DiscoverFeed['categories'] = [];

  for (const [journeyId, moduleList] of grouped.entries()) {
    const cards = moduleList
      .flatMap((module) =>
        (module.lessons ?? []).map((lesson: ModuleWithLessons['lessons'][number], index: number) => ({
          id: lesson.id,
          title: lesson.title,
          summary: lesson.summary ?? module.description ?? '',
          duration: `${lesson.estimatedMinutes ?? 15} min lesson`,
          cta: lesson.audioUrl ? 'Play audio lesson' : lesson.videoUrl ? 'Watch walkthrough' : 'Start lesson',
          accent: CARD_ACCENTS[index % CARD_ACCENTS.length],
          tag: module.title,
          ctaTarget: 'practice' as const,
          ctaUrl: '/practice',
        }))
      )
      .slice(0, 4);

    if (!cards.length) {
      continue;
    }

    categories.push({
      id: journeyId,
      label: titleize(journeyId),
      summary: moduleList[0]?.description ?? `Continue your ${titleize(journeyId)} track.`,
      cards,
    });
  }

  return categories;
}

function buildEvents(words: WordRecord[]): DiscoverFeed['events'] {
  return words.map((word) => ({
    id: word.id,
    title: `Word Lab · ${word.macedonian}`,
    description: word.exampleEn ?? word.exampleMk ?? `Learn how to use "${word.macedonian}" in context.`,
    host: 'Word Lab',
    location: 'In-app',
    startAt: word.scheduledDate.toISOString(),
    cta: 'Preview session',
    ctaTarget: 'external',
    ctaUrl: `https://mk-language-lab.com/events/${word.id}`,
  }));
}

function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function titleize(value?: string | null): string {
  if (!value) {
    return '';
  }
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}
