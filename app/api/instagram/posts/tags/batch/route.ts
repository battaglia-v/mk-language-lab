import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * POST /api/instagram/posts/tags/batch
 *
 * Fetch tags for multiple Instagram posts in a single request
 * This reduces the number of HTTP requests and database queries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { postIds: string[] };

    if (!Array.isArray(body.postIds) || body.postIds.length === 0) {
      return NextResponse.json(
        { error: 'postIds array is required' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (body.postIds.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 posts per batch' },
        { status: 400 }
      );
    }

    // Fetch all post tags in a single database query
    const postTags = await prisma.postTag.findMany({
      where: {
        instagramId: { in: body.postIds },
      },
      include: {
        tag: true,
      },
    });

    // Group tags by post ID
    const tagsByPost: Record<string, typeof postTags[0]['tag'][]> = {};

    // Initialize all post IDs with empty arrays
    for (const postId of body.postIds) {
      tagsByPost[postId] = [];
    }

    // Populate tags for each post
    for (const pt of postTags) {
      if (!tagsByPost[pt.instagramId]) {
        tagsByPost[pt.instagramId] = [];
      }
      tagsByPost[pt.instagramId].push(pt.tag);
    }

    return NextResponse.json(
      { tagsByPost },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
      }
    );
  } catch (error) {
    console.error('Error fetching batch post tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post tags' },
      { status: 500 }
    );
  }
}
