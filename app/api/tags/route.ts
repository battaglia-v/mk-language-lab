import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tags
 * 
 * Fetches all available tags
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      tags,
      count: tags.length,
    });
  } catch (error) {
    console.error('[api.tags] Failed to fetch tags', error);
    return NextResponse.json(
      { tags: [], count: 0, error: 'Failed to fetch tags' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'x-tags-source': 'fallback',
        },
      }
    );
  }
}
