import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { LessonPageContent } from '@/components/learn/LessonPageContent';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Cache curriculum data for 1 hour - it only changes on deployments
export const revalidate = 3600;

// Cached lesson data fetch - curriculum content is static between deployments
const getCachedLesson = unstable_cache(
  async (lessonId: string) => {
    return prisma.curriculumLesson.findUnique({
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
  },
  ['curriculum-lesson'],
  { revalidate: 3600, tags: ['curriculum'] }
);

// Cached next lesson lookup - also curriculum data
const getCachedNextLesson = unstable_cache(
  async (moduleId: string, orderIndex: number) => {
    return prisma.curriculumLesson.findFirst({
      where: {
        moduleId,
        orderIndex: {
          gt: orderIndex,
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  },
  ['curriculum-next-lesson'],
  { revalidate: 3600, tags: ['curriculum'] }
);

interface LessonPageProps {
  params: {
    lessonId: string;
    locale: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth();
  const { lessonId } = await params;

  // Fetch cached curriculum data (static between deployments)
  const lesson = await getCachedLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  // Get user progress for this lesson if user is logged in (NOT cached - personalized)
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

  // Find next lesson in module (cached curriculum data)
  const nextLesson = await getCachedNextLesson(lesson.moduleId, lesson.orderIndex);

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
