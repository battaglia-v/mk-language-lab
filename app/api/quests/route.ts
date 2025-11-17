import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { differenceInMinutes, formatDistanceStrict } from '@/lib/time';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Fetch active quests
    const activeQuests = await prisma.quest.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { type: 'asc' }, // daily first, then weekly, then squad
        { createdAt: 'desc' },
      ],
    });

    // Fetch user progress for these quests
    const userProgress = await prisma.userQuestProgress.findMany({
      where: {
        userId: session.user.id,
        questId: { in: activeQuests.map((q) => q.id) },
      },
    });

    const progressMap = new Map(
      userProgress.map((p) => [p.questId, p])
    );

    // Combine quests with user progress
    const questsWithProgress = activeQuests.map((quest) => {
      const progress = progressMap.get(quest.id);
      const progressValue = progress?.progress ?? 0;
      const progressPercent = Math.min(100, Math.round((progressValue / quest.target) * 100));
      const now = new Date();
      const minutesRemaining = quest.endDate ? Math.max(0, differenceInMinutes(quest.endDate, now)) : null;
      const deadlineLabel =
        minutesRemaining && quest.endDate
          ? formatDistanceStrict(now, quest.endDate, { addSuffix: true })
          : null;

      return {
        id: quest.id,
        type: quest.type,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        target: quest.target,
        targetUnit: quest.targetUnit,
        progress: progressValue,
        progressPercent,
        status: progress?.status ?? 'active',
        xpReward: quest.xpReward,
        currencyReward: quest.currencyReward,
        difficultyLevel: quest.difficultyLevel,
        startDate: quest.startDate?.toISOString() ?? null,
        endDate: quest.endDate?.toISOString() ?? null,
        completedAt: progress?.completedAt?.toISOString() ?? null,
        minutesRemaining,
        deadlineLabel,
      };
    });

    return NextResponse.json({
      quests: questsWithProgress,
    });
  } catch (error) {
    console.error('[api.quests] Failed to fetch quests', error);
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}
