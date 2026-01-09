import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { LessonPageContent } from '@/components/learn/LessonPageContent';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

interface LessonPageProps {
  params: {
    lessonId: string;
    locale: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();
  const { lessonId } = await params;

  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      summary: true,
      estimatedMinutes: true,
      difficultyLevel: true,
      useLessonRunner: true,
      lessonRunnerConfig: true,
      vocabularyItems: {
        orderBy: { orderIndex: 'asc' },
      },
      grammarNotes: {
        orderBy: { orderIndex: 'asc' },
        include: {
          conjugationTables: {
            include: {
              rows: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
        },
      },
      exercises: {
        orderBy: { orderIndex: 'asc' },
      },
      dialogues: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lines: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      module: {
        select: { title: true },
      },
      moduleId: true,
      orderIndex: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  // Get user progress for this lesson if user is logged in
  let userProgress = null;
  if (session?.user?.id) {
    userProgress = await prisma.userLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lesson.id,
        },
      },
    });
  }

  // Find next lesson in module
  const nextLesson = await prisma.curriculumLesson.findFirst({
    where: {
      moduleId: lesson.moduleId,
      orderIndex: {
        gt: lesson.orderIndex,
      },
    },
    orderBy: {
      orderIndex: 'asc',
    },
  });

  return (
    <LessonPageContent
      lesson={lesson}
      userProgress={userProgress}
      nextLesson={nextLesson}
      userId={session?.user?.id}
      useLessonRunner={lesson.useLessonRunner}
      lessonRunnerConfig={lesson.lessonRunnerConfig}
    />
  );
}
