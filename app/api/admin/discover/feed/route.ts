import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { DiscoverFeed } from '@mk/api-client';
import fallbackFeed from '@/data/discover-feed.json';

const FEED_PATH = path.join(process.cwd(), 'data', 'discover-feed.json');

export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const feed = await loadFeed();
  return NextResponse.json(feed);
}

export async function PUT(request: NextRequest) {
  const session = await auth().catch(() => null);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as unknown;
    if (!isValidDiscoverFeed(payload)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await saveFeed(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api.admin.discover.feed] Failed to save feed', error);
    return NextResponse.json({ error: 'Failed to save feed' }, { status: 500 });
  }
}

async function loadFeed(): Promise<DiscoverFeed> {
  try {
    const contents = await fs.readFile(FEED_PATH, 'utf8');
    return JSON.parse(contents) as DiscoverFeed;
  } catch (error) {
    console.warn('[api.admin.discover.feed] Falling back to bundled feed', error);
    return fallbackFeed as DiscoverFeed;
  }
}

async function saveFeed(feed: DiscoverFeed) {
  await fs.writeFile(FEED_PATH, JSON.stringify(feed, null, 2));
}

function isValidDiscoverFeed(payload: unknown): payload is DiscoverFeed {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  const feed = payload as DiscoverFeed;
  return (
    Array.isArray(feed.categories) &&
    Array.isArray(feed.events) &&
    Array.isArray(feed.quests) &&
    Array.isArray(feed.community)
  );
}
