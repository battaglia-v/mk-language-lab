// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

/**
 * GET /api/instagram/posts/[id]/tags
 *
 * Get all tags for a specific Instagram post
 */
export async function GET(
  _request: NextRequest,
  context: { params: Params }
) {
  try {
    const { id } = await context.params;

    const postTags: Awaited<ReturnType<typeof prisma.postTag.findMany>> = await prisma.postTag.findMany({
      where: {
        instagramId: id,
      },
      include: {
        tag: true,
      },
    });

    const tags = postTags.map((pt) => pt.tag);

    return NextResponse.json({
      tags,
      count: tags.length,
    });
  } catch (error) {
    console.error('Error fetching post tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post tags' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instagram/posts/[id]/tags
 *
 * Add a tag to an Instagram post (admin only)
 */
export async function POST(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check authentication (in a real app, you'd check for admin role)
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json() as { tagId: string };

    if (!body.tagId) {
      return NextResponse.json(
        { error: 'tagId is required' },
        { status: 400 }
      );
    }

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: body.tagId },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Add tag to post (upsert to handle duplicates)
    const postTag = await prisma.postTag.upsert({
      where: {
        instagramId_tagId: {
          instagramId: id,
          tagId: body.tagId,
        },
      },
      update: {},
      create: {
        instagramId: id,
        tagId: body.tagId,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json({
      success: true,
      postTag,
    });
  } catch (error) {
    console.error('Error adding tag to post:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/instagram/posts/[id]/tags
 *
 * Remove a tag from an Instagram post (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check authentication (in a real app, you'd check for admin role)
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return NextResponse.json(
        { error: 'tagId query parameter is required' },
        { status: 400 }
      );
    }

    // Remove tag from post
    await prisma.postTag.deleteMany({
      where: {
        instagramId: id,
        tagId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tag removed from post',
    });
  } catch (error) {
    console.error('Error removing tag from post:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from post' },
      { status: 500 }
    );
  }
}
// @ts-nocheck
