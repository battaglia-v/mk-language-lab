import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for progress updates
const progressSchema = z.object({
  streak: z.number().int().min(0).optional(),
  xp: z.number().int().min(0).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  hearts: z.number().int().min(0).max(5).optional(),
  lastPracticeDate: z.string().datetime().optional(),
  streakUpdatedAt: z.string().datetime().optional(),
});

// GET /api/user/progress - Fetch user's game progress
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch or create user's game progress
    let gameProgress = await prisma.gameProgress.findUnique({
      where: { userId: session.user.id },
    });

    // If no progress exists, create default progress
    if (!gameProgress) {
      gameProgress = await prisma.gameProgress.create({
        data: {
          userId: session.user.id,
          streak: 0,
          xp: 0,
          level: 'beginner',
          hearts: 5,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        progress: {
          streak: gameProgress.streak,
          xp: gameProgress.xp,
          level: gameProgress.level,
          hearts: gameProgress.hearts,
          lastPracticeDate: gameProgress.lastPracticeDate,
          streakUpdatedAt: gameProgress.streakUpdatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET PROGRESS ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/user/progress - Update user's game progress
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = progressSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Convert string dates to Date objects if provided
    const processedData: Record<string, unknown> = { ...updateData };
    if (updateData.lastPracticeDate) {
      processedData.lastPracticeDate = new Date(updateData.lastPracticeDate);
    }
    if (updateData.streakUpdatedAt) {
      processedData.streakUpdatedAt = new Date(updateData.streakUpdatedAt);
    }

    // Update or create game progress
    const gameProgress = await prisma.gameProgress.upsert({
      where: { userId: session.user.id },
      update: processedData,
      create: {
        userId: session.user.id,
        streak: updateData.streak ?? 0,
        xp: updateData.xp ?? 0,
        level: updateData.level ?? 'beginner',
        hearts: updateData.hearts ?? 5,
        lastPracticeDate: processedData.lastPracticeDate ? processedData.lastPracticeDate as Date : undefined,
        streakUpdatedAt: processedData.streakUpdatedAt ? processedData.streakUpdatedAt as Date : undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        progress: {
          streak: gameProgress.streak,
          xp: gameProgress.xp,
          level: gameProgress.level,
          hearts: gameProgress.hearts,
          lastPracticeDate: gameProgress.lastPracticeDate,
          streakUpdatedAt: gameProgress.streakUpdatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[UPDATE PROGRESS ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
