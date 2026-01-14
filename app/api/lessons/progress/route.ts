import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createScopedLogger } from '@/lib/logger';
const log = createScopedLogger('api.lessons.progress');

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, status, progress, timeSpent, currentStepIndex, stepAnswers } = body;

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
        // Step-level progress for resume capability
        ...(currentStepIndex !== undefined && { currentStepIndex }),
        ...(stepAnswers !== undefined && { stepAnswers }),
      },
      create: {
        userId: session.user.id,
        lessonId,
        status: status || 'in_progress',
        progress: progress || 0,
        timeSpent: timeSpent || 0,
        lastViewedAt: new Date(),
        ...(status === 'completed' && { completedAt: new Date() }),
        // Step-level progress for resume capability
        ...(currentStepIndex !== undefined && { currentStepIndex }),
        ...(stepAnswers !== undefined && { stepAnswers }),
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
        // Find or create journey progress with isActive=true
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
            // Mark journey as active when user completes a lesson
            isActive: true,
          },
          create: {
            userId: session.user.id,
            journeyId: lessonModule.journeyId,
            lastSessionDate: new Date(),
            totalMinutes: timeSpent || 0,
            isActive: true,
            currentModuleId: lessonModule.id,
            currentLessonId: lesson.id,
          },
        });

        // Find next lesson in this module
        let nextLesson = await prisma.curriculumLesson.findFirst({
          where: {
            moduleId: lesson.moduleId,
            orderIndex: {
              gt: lesson.orderIndex,
            },
          },
          orderBy: { orderIndex: 'asc' },
        });

        let nextModuleId = lessonModule.id;

        // If no next lesson in current module, find first lesson of next module
        if (!nextLesson) {
          const nextModule = await prisma.module.findFirst({
            where: {
              journeyId: lessonModule.journeyId,
              orderIndex: {
                gt: lessonModule.orderIndex,
              },
            },
            orderBy: { orderIndex: 'asc' },
            include: {
              lessons: {
                orderBy: { orderIndex: 'asc' },
                take: 1,
              },
            },
          });

          if (nextModule && nextModule.lessons.length > 0) {
            nextLesson = nextModule.lessons[0];
            nextModuleId = nextModule.id;
          }
        }

        // Update current position to next lesson (or keep at completed lesson if journey done)
        await prisma.journeyProgress.update({
          where: { id: journeyProgress.id },
          data: {
            currentLessonId: nextLesson ? nextLesson.id : lesson.id,
            currentModuleId: nextLesson ? nextModuleId : lessonModule.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, progress: userProgress });
  } catch (error) {
    log.error('Failed to update lesson progress', {
      error,
      lessonId: (await request.json().catch(() => ({}))).lessonId,
      userId: (await auth())?.user?.id,
    });

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Progress already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
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
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    log.error('Failed to fetch lesson progress', {
      error,
      lessonId,
      userId: (await auth())?.user?.id,
    });

    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
