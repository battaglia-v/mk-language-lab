import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, status, progress, timeSpent } = body;

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    // Verify lesson exists
    const lesson = await prisma.curriculumLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Update or create user lesson progress
    const userProgress = await prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: {
        status: status || 'in_progress',
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        lastViewedAt: new Date(),
        ...(status === 'completed' && { completedAt: new Date() }),
      },
      create: {
        userId: session.user.id,
        lessonId,
        status: status || 'in_progress',
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        lastViewedAt: new Date(),
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    });

    // If lesson completed, update journey progress
    if (status === 'completed') {
      // Find which journey this lesson belongs to
      const lessonModule = await prisma.module.findUnique({
        where: { id: lesson.moduleId },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (lessonModule) {
        // Find or create journey progress
        const journeyProgress = await prisma.journeyProgress.upsert({
          where: {
            userId_journeyId: {
              userId: session.user.id,
              journeyId: lessonModule.journeyId,
            },
          },
          update: {
            lastSessionDate: new Date(),
            totalMinutes: {
              increment: timeSpent || 0,
            },
          },
          create: {
            userId: session.user.id,
            journeyId: lessonModule.journeyId,
            lastSessionDate: new Date(),
            totalMinutes: timeSpent || 0,
          },
        });

        // Find next lesson in this module or next module
        const nextLesson = await prisma.curriculumLesson.findFirst({
          where: {
            moduleId: lesson.moduleId,
            orderIndex: {
              gt: lesson.orderIndex,
            },
          },
          orderBy: { orderIndex: 'asc' },
        });

        if (nextLesson) {
          // Update current lesson pointer
          await prisma.journeyProgress.update({
            where: { id: journeyProgress.id },
            data: {
              currentLessonId: nextLesson.id,
              currentModuleId: lessonModule.id,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, progress: userProgress });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
    }

    const progress = await prisma.userLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
