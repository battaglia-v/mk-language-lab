import { NextRequest, NextResponse } from 'next/server';
import { getMobileSessionFromRequest } from '@/lib/mobile-auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  const mobileSession = await getMobileSessionFromRequest(request);
  if (!mobileSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = mobileSession.user.id;
  const body = await request.json();
  const { xpEarned = 10 } = body;

  // Update lesson progress
  await prisma.userLessonProgress.upsert({
    where: {
      userId_lessonId: {
        lessonId,
        userId,
      },
    },
    update: {
      status: 'completed',
      completedAt: new Date(),
    },
    create: {
      lessonId,
      userId,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Update game progress (add XP)
  await prisma.gameProgress.upsert({
    where: { userId },
    update: {
      xp: { increment: xpEarned },
      todayXP: { increment: xpEarned },
    },
    create: {
      userId,
      xp: xpEarned,
      todayXP: xpEarned,
      streak: 1,
    },
  });

  // Update journey progress to next lesson
  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: lessonId },
    include: {
      module: true,
    },
  });

  if (lesson) {
    // Find next lesson
    const nextLesson = await prisma.curriculumLesson.findFirst({
      where: {
        OR: [
          // Next lesson in same module
          {
            moduleId: lesson.moduleId,
            orderIndex: { gt: lesson.orderIndex },
          },
          // First lesson of next module in same journey
          {
            module: {
              journeyId: lesson.module.journeyId,
              orderIndex: { gt: lesson.module.orderIndex },
            },
            orderIndex: 0,
          },
        ],
      },
      orderBy: [
        { module: { orderIndex: 'asc' } },
        { orderIndex: 'asc' },
      ],
      include: { module: true },
    });

    if (nextLesson) {
      await prisma.journeyProgress.upsert({
        where: {
          userId_journeyId: {
            userId,
            journeyId: lesson.module.journeyId,
          },
        },
        update: {
          currentLessonId: nextLesson.id,
          currentModuleId: nextLesson.moduleId,
          lastSessionDate: new Date(),
        },
        create: {
          userId,
          journeyId: lesson.module.journeyId,
          currentLessonId: nextLesson.id,
          currentModuleId: nextLesson.moduleId,
          isActive: true,
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    xpEarned,
  });
}
