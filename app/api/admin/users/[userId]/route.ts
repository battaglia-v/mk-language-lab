import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  name: z.string().min(1).optional(),
});

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get detailed stats
    const [gameProgress, currency, recentAttempts, badges] = await Promise.all([
      prisma.gameProgress.findUnique({
        where: { userId },
        select: {
          streak: true,
          longestStreak: true,
          xp: true,
          level: true,
          hearts: true,
          totalLessons: true,
          lastPracticeDate: true,
          createdAt: true,
        },
      }),
      prisma.currency.findUnique({
        where: { userId },
        select: { gems: true, coins: true },
      }),
      prisma.exerciseAttempt.findMany({
        where: { userId },
        take: 10,
        orderBy: { attemptedAt: 'desc' },
        select: {
          id: true,
          isCorrect: true,
          attemptedAt: true,
          exercise: {
            select: {
              type: true,
            },
          },
        },
      }),
      prisma.userBadge.findMany({
        where: { userId },
        take: 10,
        orderBy: { earnedAt: 'desc' },
        select: {
          id: true,
          badgeId: true,
          earnedAt: true,
        },
      }),
    ]);

    // Get aggregate stats
    const [totalAttempts, correctAttempts, journeyProgress] = await Promise.all([
      prisma.exerciseAttempt.count({ where: { userId } }),
      prisma.exerciseAttempt.count({ where: { userId, isCorrect: true } }),
      prisma.journeyProgress.findMany({
        where: { userId },
        select: {
          journeyId: true,
          isActive: true,
          totalMinutes: true,
          streakCount: true,
        },
      }),
    ]);

    return NextResponse.json({
      user,
      stats: {
        gameProgress: gameProgress ?? {
          streak: 0,
          longestStreak: 0,
          xp: 0,
          level: 'beginner',
          hearts: 5,
          totalLessons: 0,
          lastPracticeDate: null,
        },
        currency: currency ?? { gems: 0, coins: 0 },
        totalAttempts,
        correctAttempts,
        accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        journeyProgress,
        badges,
        recentAttempts,
      },
    });
  } catch (error) {
    console.error('[ADMIN_USER_DETAIL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid data' },
        { status: 400 }
      );
    }

    // Prevent admin from demoting themselves
    if (validation.data.role === 'user' && userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot demote yourself' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    console.log('[ADMIN_USER_UPDATE]', {
      adminId: session.user.id,
      targetUserId: userId,
      changes: validation.data,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[ADMIN_USER_UPDATE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account from admin panel' },
        { status: 400 }
      );
    }

    // Get user info for logging before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascades to all related data)
    await prisma.user.delete({ where: { id: userId } });

    console.log('[ADMIN_USER_DELETE]', {
      adminId: session.user.id,
      deletedUser: user,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.email} has been deleted`,
    });
  } catch (error) {
    console.error('[ADMIN_USER_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
