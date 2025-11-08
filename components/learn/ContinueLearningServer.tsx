import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import ContinueLearningWidget from './ContinueLearningWidget';

const prisma = new PrismaClient();

export default async function ContinueLearningServer() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    // Get user's active journey
    const activeJourney = await prisma.journeyProgress.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        currentLesson: {
          include: {
            module: true,
          },
        },
      },
    });

    // If user has an active journey with a current lesson, show it
    if (activeJourney?.currentLesson) {
      const userProgress = await prisma.userLessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: activeJourney.currentLesson.id,
          },
        },
      });

      return (
        <ContinueLearningWidget
          lesson={activeJourney.currentLesson}
          progress={userProgress}
          journeyTitle={undefined}
        />
      );
    }

    // Otherwise, find the first lesson of any journey
    const firstModule = await prisma.module.findFirst({
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          take: 1,
        },
      },
    });

    if (firstModule && firstModule.lessons[0]) {
      return (
        <ContinueLearningWidget
          lesson={{
            ...firstModule.lessons[0],
            module: {
              title: firstModule.title,
            },
          }}
          progress={null}
          journeyTitle={undefined}
        />
      );
    }

    return null;
  } catch (error) {
    console.error('Error loading continue learning widget:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
