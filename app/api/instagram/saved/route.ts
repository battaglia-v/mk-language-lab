import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { InstagramPost } from '@/types/instagram';

export const dynamic = 'force-dynamic';

/**
 * GET /api/instagram/saved
 *
 * Fetches all saved Instagram posts for the authenticated user
 *
 * Returns:
 * - items: Array of saved Instagram posts
 * - meta: Metadata about the response
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch saved posts from database
    const savedPosts: Awaited<ReturnType<typeof prisma.savedPost.findMany>> = await prisma.savedPost.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    // Transform database records to InstagramPost format
    const items: InstagramPost[] = savedPosts.map((post) => ({
      id: post.instagramId,
      caption: post.caption,
      media_type: post.mediaType as InstagramPost['media_type'],
      media_url: post.mediaUrl,
      permalink: post.permalink,
      timestamp: post.timestamp.toISOString(),
      thumbnail_url: post.thumbnailUrl ?? undefined,
    }));

    return NextResponse.json({
      items,
      meta: {
        count: items.length,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instagram/saved
 *
 * Saves an Instagram post for the authenticated user
 *
 * Body:
 * - post: Instagram post object to save
 *
 * Returns:
 * - success: boolean
 * - savedPost: The saved post data
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json() as { post: InstagramPost };
    const { post } = body;

    if (!post || !post.id) {
      return NextResponse.json(
        { error: 'Invalid post data' },
        { status: 400 }
      );
    }

    // Save post to database (upsert to handle duplicates)
    const savedPost = await prisma.savedPost.upsert({
      where: {
        userId_instagramId: {
          userId: session.user.id,
          instagramId: post.id,
        },
      },
      update: {
        // Update fields in case post was modified
        caption: post.caption,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        thumbnailUrl: post.thumbnail_url ?? null,
        permalink: post.permalink,
        timestamp: new Date(post.timestamp),
      },
      create: {
        userId: session.user.id,
        instagramId: post.id,
        caption: post.caption,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        thumbnailUrl: post.thumbnail_url ?? null,
        permalink: post.permalink,
        timestamp: new Date(post.timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      savedPost: {
        id: savedPost.instagramId,
        savedAt: savedPost.savedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}
