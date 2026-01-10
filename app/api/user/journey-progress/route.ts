import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createScopedLogger } from '@/lib/logger';
const log = createScopedLogger('api.user.journey-progress');

/**
 * GET /api/user/journey-progress
 *
 * Returns user's active journey progress with curriculum context.
 * If journeyId is provided, returns that specific journey.
 * Otherwise, returns the active journey (isActive=true).
 *
 * Response includes:
 * - journeyId (ukim-a1, ukim-a2, ukim-b1)
 * - currentModule (id, title, orderIndex)
 * - currentLesson (id, title, orderIndex, summary)
 * - nextLesson (if exists)
 * - completedLessons count
 * - totalLessons count
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const journeyId = searchParams.get('journeyId');

    // Build query based on whether journeyId is specified
    const whereClause = journeyId
      ? { userId: session.user.id, journeyId }
      : { userId: session.user.id, isActive: true };

    // Get journey progress with current module and lesson relations
    const journeyProgress = await prisma.journeyProgress.findFirst({
      where: whereClause,
      include: {
        currentModule: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
            journeyId: true,
          },
        },
        currentLesson: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
            summary: true,
            moduleId: true,
          },
        },
      },
    });

    // No journey progress found - return null (new user state)
    if (!journeyProgress) {
      return NextResponse.json({ journeyProgress: null });
    }

    // Get total lessons count for this journey
    const totalLessons = await prisma.curriculumLesson.count({
      where: {
        module: {
          journeyId: journeyProgress.journeyId,
        },
      },
    });

    // Get completed lessons count for this user in this journey
    const completedLessons = await prisma.userLessonProgress.count({
      where: {
        userId: session.user.id,
        status: 'completed',
        lesson: {
          module: {
            journeyId: journeyProgress.journeyId,
          },
        },
      },
    });

    // Find next lesson
    let nextLesson = null;

    if (journeyProgress.currentLesson && journeyProgress.currentModule) {
      // First try to find next lesson in current module
      nextLesson = await prisma.curriculumLesson.findFirst({
        where: {
          moduleId: journeyProgress.currentLesson.moduleId,
          orderIndex: { gt: journeyProgress.currentLesson.orderIndex },
        },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          summary: true,
          moduleId: true,
        },
      });

      // If no next lesson in current module, find first lesson of next module
      if (!nextLesson) {
        const nextModule = await prisma.module.findFirst({
          where: {
            journeyId: journeyProgress.journeyId,
            orderIndex: { gt: journeyProgress.currentModule.orderIndex },
          },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              take: 1,
              select: {
                id: true,
                title: true,
                orderIndex: true,
                summary: true,
                moduleId: true,
              },
            },
          },
        });

        if (nextModule && nextModule.lessons.length > 0) {
          nextLesson = nextModule.lessons[0];
        }
      }
    }

    return NextResponse.json({
      journeyProgress: {
        journeyId: journeyProgress.journeyId,
        isActive: journeyProgress.isActive,
        currentModule: journeyProgress.currentModule,
        currentLesson: journeyProgress.currentLesson,
        nextLesson,
        completedLessons,
        totalLessons,
        lastSessionDate: journeyProgress.lastSessionDate,
        totalMinutes: journeyProgress.totalMinutes,
        streakCount: journeyProgress.streakCount,
      },
    });
  } catch (error) {
    log.error('Failed to fetch journey progress', {
      error,
      userId: (await auth())?.user?.id,
    });

    return NextResponse.json(
      { error: 'Failed to fetch journey progress' },
      { status: 500 }
    );
  }
}
