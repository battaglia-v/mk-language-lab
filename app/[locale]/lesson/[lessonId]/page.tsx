import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import LessonContent from '@/components/learn/LessonContent';
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

  const lesson = await prisma.curriculumLesson.findUnique({
    where: { id: params.lessonId },
    include: {
      vocabularyItems: {
        orderBy: { orderIndex: 'asc' },
      },
      grammarNotes: {
        orderBy: { orderIndex: 'asc' },
      },
      exercises: {
        orderBy: { orderIndex: 'asc' },
      },
      module: true,
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
    <LessonContent
      lesson={lesson}
      userProgress={userProgress}
      nextLesson={nextLesson}
      userId={session?.user?.id}
    />
  );
}
