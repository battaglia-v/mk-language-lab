import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

const STREAK_FREEZE_COST = 50; // gems to freeze streak for 1 day
const STREAK_REPAIR_COST = 100; // gems to repair a lost streak

const streakActionSchema = z.object({
  action: z.enum(['freeze', 'repair']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's game progress and currency
    const [gameProgress, currency] = await Promise.all([
      prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.currency.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    const now = new Date();
    const lastPractice = gameProgress?.lastPracticeDate;
    const hoursSinceLastPractice = lastPractice
      ? (now.getTime() - new Date(lastPractice).getTime()) / (1000 * 60 * 60)
      : null;

    // Check if streak is at risk (no practice in last 24-48 hours)
    const streakAtRisk = hoursSinceLastPractice && hoursSinceLastPractice > 24 && hoursSinceLastPractice <= 48;
    // Check if streak was lost (no practice in 48+ hours)
    const streakLost = hoursSinceLastPractice && hoursSinceLastPractice > 48;

    return NextResponse.json({
      currentStreak: gameProgress?.streak ?? 0,
      longestStreak: gameProgress?.longestStreak ?? 0,
      lastPracticeDate: lastPractice,
      gems: currency?.gems ?? 0,
      streakAtRisk,
      streakLost,
      freezeCost: STREAK_FREEZE_COST,
      repairCost: STREAK_REPAIR_COST,
      canFreeze: streakAtRisk && (currency?.gems ?? 0) >= STREAK_FREEZE_COST,
      canRepair: streakLost && (currency?.gems ?? 0) >= STREAK_REPAIR_COST,
    });
  } catch (error) {
    console.error('[STREAK STATUS ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to get streak status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = streakActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid action. Use "freeze" or "repair".' },
        { status: 400 }
      );
    }

    const { action } = validation.data;

    // Get current state
    const [gameProgress, currency] = await Promise.all([
      prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.currency.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    if (!gameProgress) {
      return NextResponse.json(
        { error: 'No game progress found. Start practicing first!' },
        { status: 400 }
      );
    }

    const now = new Date();
    const lastPractice = gameProgress.lastPracticeDate;
    const hoursSinceLastPractice = lastPractice
      ? (now.getTime() - new Date(lastPractice).getTime()) / (1000 * 60 * 60)
      : null;

    const gems = currency?.gems ?? 0;

    if (action === 'freeze') {
      // Can only freeze if streak is at risk (24-48 hours)
      const streakAtRisk = hoursSinceLastPractice && hoursSinceLastPractice > 24 && hoursSinceLastPractice <= 48;

      if (!streakAtRisk) {
        return NextResponse.json(
          { error: 'Streak is not at risk. Keep practicing!' },
          { status: 400 }
        );
      }

      if (gems < STREAK_FREEZE_COST) {
        return NextResponse.json(
          { error: `Not enough gems. You need ${STREAK_FREEZE_COST} gems to freeze your streak.` },
          { status: 400 }
        );
      }

      // Freeze: extend lastPracticeDate by 24 hours and deduct gems
      await prisma.$transaction([
        prisma.gameProgress.update({
          where: { userId: session.user.id },
          data: {
            lastPracticeDate: new Date(lastPractice!.getTime() + 24 * 60 * 60 * 1000),
            streakUpdatedAt: now,
          },
        }),
        prisma.currency.update({
          where: { userId: session.user.id },
          data: { gems: { decrement: STREAK_FREEZE_COST } },
        }),
        prisma.currencyTransaction.create({
          data: {
            userId: session.user.id,
            currencyType: 'gems',
            amount: -STREAK_FREEZE_COST,
            reason: 'streak_freeze',
          },
        }),
      ]);

      console.log('[STREAK] Freeze used:', { userId: session.user.id, streak: gameProgress.streak });

      return NextResponse.json({
        success: true,
        message: 'Streak frozen! You have 24 more hours to practice.',
        newGems: gems - STREAK_FREEZE_COST,
        streak: gameProgress.streak,
      });
    } else if (action === 'repair') {
      // Can only repair if streak was lost (48+ hours)
      const streakLost = hoursSinceLastPractice && hoursSinceLastPractice > 48;

      if (!streakLost) {
        return NextResponse.json(
          { error: 'Your streak is not lost. Use freeze if at risk.' },
          { status: 400 }
        );
      }

      if (gameProgress.streak === 0) {
        return NextResponse.json(
          { error: 'No streak to repair. Start a new streak by practicing!' },
          { status: 400 }
        );
      }

      if (gems < STREAK_REPAIR_COST) {
        return NextResponse.json(
          { error: `Not enough gems. You need ${STREAK_REPAIR_COST} gems to repair your streak.` },
          { status: 400 }
        );
      }

      // Repair: set lastPracticeDate to yesterday (streak continues) and deduct gems
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      await prisma.$transaction([
        prisma.gameProgress.update({
          where: { userId: session.user.id },
          data: {
            lastPracticeDate: yesterday,
            streakUpdatedAt: now,
          },
        }),
        prisma.currency.update({
          where: { userId: session.user.id },
          data: { gems: { decrement: STREAK_REPAIR_COST } },
        }),
        prisma.currencyTransaction.create({
          data: {
            userId: session.user.id,
            currencyType: 'gems',
            amount: -STREAK_REPAIR_COST,
            reason: 'streak_repair',
          },
        }),
      ]);

      console.log('[STREAK] Repair used:', { userId: session.user.id, streak: gameProgress.streak });

      return NextResponse.json({
        success: true,
        message: `Streak repaired! Your ${gameProgress.streak}-day streak is saved.`,
        newGems: gems - STREAK_REPAIR_COST,
        streak: gameProgress.streak,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[STREAK ACTION ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process streak action' },
      { status: 500 }
    );
  }
}
