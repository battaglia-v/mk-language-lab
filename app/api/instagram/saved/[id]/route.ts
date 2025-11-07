import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;

/**
 * DELETE /api/instagram/saved/[id]
 *
 * Removes a saved Instagram post for the authenticated user
 *
 * Params:
 * - id: Instagram post ID to unsave
 *
 * Returns:
 * - success: boolean
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Instagram post ID is required' },
        { status: 400 }
      );
    }

    // Delete saved post from database
    await prisma.savedPost.deleteMany({
      where: {
        userId: session.user.id,
        instagramId: id,
      },
    });

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error('Error unsaving post:', error);
    return NextResponse.json(
      { error: 'Failed to unsave post' },
      { status: 500 }
    );
  }
}
