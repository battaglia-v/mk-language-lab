import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const progressSchema = z.object({
  questId: z.string(),
  increment: z.number().int().positive(),
});

export async function POST(request: Request) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = progressSchema.parse(body);

    // Fetch the quest
    const quest = await prisma.quest.findUnique({
      where: { id: data.questId },
    });

    if (!quest || !quest.isActive) {
      return NextResponse.json(
        { error: 'Quest not found or inactive' },
        { status: 404 }
      );
    }

    // Get or create user quest progress
    const existingProgress = await prisma.userQuestProgress.findUnique({
      where: {
        userId_questId: {
          userId: session.user.id,
          questId: data.questId,
        },
      },
    });

    // Check if already completed
    if (existingProgress?.status === 'completed') {
      return NextResponse.json(
        { error: 'Quest already completed' },
        { status: 400 }
      );
    }

    const currentProgress = existingProgress?.progress ?? 0;
    const newProgress = Math.min(quest.target, currentProgress + data.increment);
    const isCompleted = newProgress >= quest.target;

    // Update progress
    const updatedProgress = await prisma.userQuestProgress.upsert({
      where: {
        userId_questId: {
          userId: session.user.id,
          questId: data.questId,
        },
      },
      update: {
        progress: newProgress,
        status: isCompleted ? 'completed' : 'active',
        completedAt: isCompleted ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        questId: data.questId,
        progress: newProgress,
        status: isCompleted ? 'completed' : 'active',
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // If completed, award XP and currency
    if (isCompleted && !existingProgress) {
      // Update GameProgress with XP
      await prisma.gameProgress.upsert({
        where: { userId: session.user.id },
        update: {
          xp: { increment: quest.xpReward },
        },
        create: {
          userId: session.user.id,
          xp: quest.xpReward,
        },
      });

      // Update Currency with gems
      await prisma.currency.upsert({
        where: { userId: session.user.id },
        update: {
          gems: { increment: quest.currencyReward },
          lifetimeGemsEarned: { increment: quest.currencyReward },
        },
        create: {
          userId: session.user.id,
          gems: quest.currencyReward,
          lifetimeGemsEarned: quest.currencyReward,
        },
      });

      // Log the currency transaction
      await prisma.currencyTransaction.create({
        data: {
          userId: session.user.id,
          currencyType: 'gems',
          amount: quest.currencyReward,
          reason: 'quest_reward',
          metadata: JSON.stringify({
            questId: quest.id,
            questTitle: quest.title,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        questId: updatedProgress.questId,
        progress: updatedProgress.progress,
        target: quest.target,
        status: updatedProgress.status,
        isCompleted,
        xpAwarded: isCompleted ? quest.xpReward : 0,
        gemsAwarded: isCompleted ? quest.currencyReward : 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[api.quests.progress] Failed to update quest progress', error);
    return NextResponse.json(
      { error: 'Failed to update quest progress' },
      { status: 500 }
    );
  }
}
