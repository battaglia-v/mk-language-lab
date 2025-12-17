import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/quests/assign-daily
 * 
 * Assigns 2-3 daily quests to the authenticated user.
 * If the user already has active daily quests for today, returns existing ones.
 * 
 * Quest assignment logic:
 * - Picks 2-3 random active daily quests
 * - Creates UserQuestProgress entries for each
 * - Ensures user doesn't get duplicate quests
 */
export async function POST() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const today = new Date();
    // Get start and end of today without date-fns
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Check if user already has daily quests assigned today
    const existingProgress = await prisma.userQuestProgress.findMany({
      where: {
        userId,
        startedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        quest: {
          type: 'daily',
        },
      },
      include: {
        quest: true,
      },
    });

    // If user already has daily quests today, return them
    if (existingProgress.length > 0) {
      return NextResponse.json({
        assigned: false,
        message: 'Daily quests already assigned for today',
        quests: existingProgress.map((p) => ({
          id: p.quest.id,
          title: p.quest.title,
          description: p.quest.description,
          target: p.quest.target,
          targetUnit: p.quest.targetUnit,
          progress: p.progress,
          progressPercent: Math.min(100, Math.round((p.progress / p.quest.target) * 100)),
          status: p.status,
          xpReward: p.quest.xpReward,
          currencyReward: p.quest.currencyReward,
        })),
      });
    }

    // Fetch all active daily quests
    const availableDailyQuests = await prisma.quest.findMany({
      where: {
        type: 'daily',
        isActive: true,
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: today } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: today } },
            ],
          },
        ],
      },
    });

    if (availableDailyQuests.length === 0) {
      return NextResponse.json({
        assigned: false,
        message: 'No daily quests available',
        quests: [],
      });
    }

    // Randomly select 2-3 quests
    const numQuests = Math.min(
      availableDailyQuests.length,
      Math.floor(Math.random() * 2) + 2 // 2 or 3 quests
    );
    
    // Shuffle and pick
    const shuffled = availableDailyQuests.sort(() => Math.random() - 0.5);
    const selectedQuests = shuffled.slice(0, numQuests);

    // Create progress entries for each selected quest
    const progressEntries = await Promise.all(
      selectedQuests.map((quest) =>
        prisma.userQuestProgress.create({
          data: {
            userId,
            questId: quest.id,
            progress: 0,
            status: 'active',
          },
          include: {
            quest: true,
          },
        })
      )
    );

    return NextResponse.json({
      assigned: true,
      message: `Assigned ${numQuests} daily quests`,
      quests: progressEntries.map((p) => ({
        id: p.quest.id,
        title: p.quest.title,
        description: p.quest.description,
        target: p.quest.target,
        targetUnit: p.quest.targetUnit,
        progress: p.progress,
        progressPercent: 0,
        status: p.status,
        xpReward: p.quest.xpReward,
        currencyReward: p.quest.currencyReward,
      })),
    });
  } catch (error) {
    console.error('[api.quests.assign-daily] Error:', error);
    return NextResponse.json(
      { error: 'Failed to assign daily quests' },
      { status: 500 }
    );
  }
}

