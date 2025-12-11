import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const exportSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// POST /api/user/export - Export all user data (GDPR compliance)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const parsed = exportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password for OAuth users - they may not have a password
    if (user.password) {
      const isValid = await bcrypt.compare(parsed.data.password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
    }

    // Fetch all user data in parallel
    const [
      gameProgress,
      mission,
      currency,
      currencyTransactions,
      badges,
      journeyProgress,
      lessonProgress,
      exerciseAttempts,
      questProgress,
      tutorSessions,
      savedPosts,
      notifications,
      friendships,
      customDecks,
    ] = await Promise.all([
      prisma.gameProgress.findUnique({
        where: { userId },
        select: {
          streak: true,
          xp: true,
          level: true,
          hearts: true,
          lastPracticeDate: true,
          dailyGoalXP: true,
          todayXP: true,
          longestStreak: true,
          totalLessons: true,
          createdAt: true,
        },
      }),
      prisma.mission.findUnique({
        where: { userId },
        select: {
          goal: true,
          level: true,
          dailyGoalMinutes: true,
          reminderWindows: true,
          onboardingCompletedAt: true,
          createdAt: true,
        },
      }),
      prisma.currency.findUnique({
        where: { userId },
        select: {
          gems: true,
          coins: true,
          lifetimeGemsEarned: true,
          updatedAt: true,
        },
      }),
      prisma.currencyTransaction.findMany({
        where: { userId },
        select: {
          currencyType: true,
          amount: true,
          reason: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100, // Last 100 transactions
      }),
      prisma.userBadge.findMany({
        where: { userId },
        select: {
          badgeId: true,
          earnedAt: true,
          purchasedAt: true,
          isEquipped: true,
        },
      }),
      prisma.journeyProgress.findMany({
        where: { userId },
        select: {
          journeyId: true,
          isActive: true,
          totalMinutes: true,
          streakCount: true,
          lastSessionDate: true,
          createdAt: true,
        },
      }),
      prisma.userLessonProgress.findMany({
        where: { userId },
        select: {
          lessonId: true,
          status: true,
          progress: true,
          timeSpent: true,
          completedAt: true,
        },
      }),
      prisma.exerciseAttempt.findMany({
        where: { userId },
        select: {
          exerciseId: true,
          isCorrect: true,
          userAnswer: true,
          attemptedAt: true,
        },
        orderBy: { attemptedAt: 'desc' },
        take: 500, // Last 500 attempts
      }),
      prisma.userQuestProgress.findMany({
        where: { userId },
        select: {
          questId: true,
          status: true,
          progress: true,
          completedAt: true,
        },
      }),
      prisma.tutorSession.findMany({
        where: { userId },
        select: {
          messages: true,
          language: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Last 50 sessions
      }),
      prisma.savedPost.findMany({
        where: { userId },
        select: {
          instagramId: true,
          caption: true,
          mediaUrl: true,
          permalink: true,
          savedAt: true,
        },
      }),
      prisma.notification.findMany({
        where: { userId },
        select: {
          type: true,
          title: true,
          body: true,
          isRead: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.friendship.findMany({
        where: {
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        select: {
          status: true,
          createdAt: true,
          requester: { select: { name: true, email: true } },
          addressee: { select: { name: true, email: true } },
        },
      }),
      prisma.customDeck.findMany({
        where: { userId },
        select: {
          name: true,
          description: true,
          createdAt: true,
          cards: {
            select: {
              macedonian: true,
              english: true,
              category: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    // Build export object
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      gameProgress,
      mission,
      currency,
      currencyTransactions,
      badges,
      journeyProgress,
      lessonProgress,
      exerciseAttempts: {
        count: exerciseAttempts.length,
        recentAttempts: exerciseAttempts,
      },
      questProgress,
      tutorSessions: tutorSessions.map(
        (s: (typeof tutorSessions)[number]) => ({
          ...s,
          messages: JSON.parse(s.messages || '[]'),
        })
      ),
      savedPosts,
      notifications,
      friendships: friendships.map((f: (typeof friendships)[number]) => ({
        status: f.status,
        createdAt: f.createdAt,
        friend:
          f.requester.email === user.email ? f.addressee.name : f.requester.name,
      })),
      customDecks,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mk-language-lab-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('[api.user.export] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
}
