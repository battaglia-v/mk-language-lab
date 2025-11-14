import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const setupSchema = z.object({
  goal: z.enum(['conversation', 'travel', 'culture', 'reading', 'professional']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  dailyGoalMinutes: z.number().int().min(5).max(120),
  reminderWindows: z.array(z.string()).optional().default([]),
  questSeeds: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = setupSchema.parse(body);

    // Create or update mission
    const mission = await prisma.mission.upsert({
      where: { userId: session.user.id },
      update: {
        goal: data.goal,
        level: data.level,
        dailyGoalMinutes: data.dailyGoalMinutes,
        reminderWindows: data.reminderWindows,
        questSeeds: data.questSeeds,
        onboardingCompletedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        goal: data.goal,
        level: data.level,
        dailyGoalMinutes: data.dailyGoalMinutes,
        reminderWindows: data.reminderWindows,
        questSeeds: data.questSeeds,
        onboardingCompletedAt: new Date(),
      },
    });

    // Also update or create GameProgress to sync level
    await prisma.gameProgress.upsert({
      where: { userId: session.user.id },
      update: {
        level: data.level,
      },
      create: {
        userId: session.user.id,
        level: data.level,
      },
    });

    return NextResponse.json({
      success: true,
      mission: {
        id: mission.id,
        goal: mission.goal,
        level: mission.level,
        dailyGoalMinutes: mission.dailyGoalMinutes,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[api.missions.setup] Failed to setup mission', error);
    return NextResponse.json(
      { error: 'Failed to setup mission' },
      { status: 500 }
    );
  }
}
