import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/friends/search - Search for users to add as friends
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Get existing friendships to mark status
    const existingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: {
        requesterId: true,
        addresseeId: true,
        status: true,
      },
    });

    // Build a map of user ID -> friendship status
    const friendshipMap = new Map<
      string,
      { status: string; isRequester: boolean }
    >();
    for (const f of existingFriendships) {
      const otherId = f.requesterId === userId ? f.addresseeId : f.requesterId;
      friendshipMap.set(otherId, {
        status: f.status,
        isRequester: f.requesterId === userId,
      });
    }

    // Search users by name or email (exclude self)
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        gameProgress: {
          select: {
            level: true,
            xp: true,
          },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    // Transform results with friendship status
    type UserWithProgress = (typeof users)[number];
    const results = users.map((user: UserWithProgress) => {
      const existing = friendshipMap.get(user.id);
      return {
        id: user.id,
        name: user.name ?? 'Anonymous',
        image: user.image,
        level: user.gameProgress?.level ?? 'beginner',
        xp: user.gameProgress?.xp ?? 0,
        friendshipStatus: existing?.status ?? null,
        isRequester: existing?.isRequester ?? false,
      };
    });

    return NextResponse.json({
      users: results,
      count: results.length,
    });
  } catch (error) {
    console.error('[api.user.friends.search] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
