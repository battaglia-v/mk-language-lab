import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/friends/leaderboard - Get friend leaderboard
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all accepted friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      select: {
        requesterId: true,
        addresseeId: true,
      },
    });

    // Extract friend IDs
    type FriendshipSelect = (typeof friendships)[number];
    const friendIds = friendships.map(
      (f: FriendshipSelect) =>
        f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    // Include self in the leaderboard
    const allUserIds = [userId, ...friendIds];

    // Get game progress for all users
    const usersWithProgress = await prisma.user.findMany({
      where: {
        id: { in: allUserIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
        gameProgress: {
          select: {
            level: true,
            xp: true,
            streak: true,
            todayXP: true,
          },
        },
      },
    });

    // Transform and sort by today's XP (or total XP as fallback)
    type UserWithProgress = (typeof usersWithProgress)[number];
    interface LeaderboardEntry {
      id: string;
      name: string;
      image: string | null;
      level: string;
      xp: number;
      todayXP: number;
      streak: number;
      isCurrentUser: boolean;
    }
    const leaderboard: LeaderboardEntry[] = usersWithProgress
      .map((user: UserWithProgress) => ({
        id: user.id,
        name: user.name ?? 'Anonymous',
        image: user.image,
        level: user.gameProgress?.level ?? 'beginner',
        xp: user.gameProgress?.xp ?? 0,
        todayXP: user.gameProgress?.todayXP ?? 0,
        streak: user.gameProgress?.streak ?? 0,
        isCurrentUser: user.id === userId,
      }))
      .sort(
        (a: LeaderboardEntry, b: LeaderboardEntry) =>
          b.todayXP - a.todayXP || b.xp - a.xp
      );

    // Add rank
    const rankedLeaderboard = leaderboard.map(
      (user: LeaderboardEntry, index: number) => ({
        ...user,
        rank: index + 1,
      })
    );

    // Find current user's position
    type RankedEntry = LeaderboardEntry & { rank: number };
    const currentUserRank =
      rankedLeaderboard.find((u: RankedEntry) => u.isCurrentUser)?.rank ?? 0;

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUserRank,
      friendCount: friendIds.length,
    });
  } catch (error) {
    console.error('[api.user.friends.leaderboard] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend leaderboard' },
      { status: 500 }
    );
  }
}
