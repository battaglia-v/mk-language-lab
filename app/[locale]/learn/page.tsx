import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LearnPageClient } from "@/components/learn/LearnPageClient";
import { createStarterPath, starterPathNodes } from "@/lib/learn/starter-path";
import { createA2Path, a2PathNodes } from "@/lib/learn/a2-path";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LearnPage() {
  const locale = await getLocale();

  const session = await auth().catch(() => null);

  let gameProgress = {
    xp: 0,
    streak: 0,
    dailyGoalXP: 20,
    todayXP: 0,
    totalLessons: 0,
  };

  let completedNodeIds: string[] = [];
  let currentLesson: { id: string; title: string; moduleTitle: string; lessonNumber: number } | undefined;
  let journeyProgress: { completedCount: number; totalCount: number } | undefined;

  if (session?.user?.id) {
    try {
      // Fetch game progress
      const progress = await prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      });
      if (progress) {
        gameProgress = {
          xp: progress.xp,
          streak: progress.streak,
          dailyGoalXP: progress.dailyGoalXP || 20,
          todayXP: progress.todayXP,
          totalLessons: progress.totalLessons,
        };

        const completedCount = Math.min(progress.totalLessons, starterPathNodes.length);
        completedNodeIds = Array.from(
          { length: completedCount },
          (_, i) => `node-${i + 1}`
        );
      }

      // Fetch journey progress for current curriculum position
      const journey = await prisma.journeyProgress.findFirst({
        where: { userId: session.user.id, isActive: true },
        include: {
          currentLesson: {
            select: {
              id: true,
              title: true,
              orderIndex: true,
            },
          },
          currentModule: {
            select: {
              title: true,
            },
          },
        },
      });

      if (journey?.currentLesson && journey.currentModule) {
        // Get total lessons in this journey
        const totalLessons = await prisma.curriculumLesson.count({
          where: {
            module: {
              journeyId: journey.journeyId,
            },
          },
        });

        // Get completed lessons count
        const completedLessons = await prisma.userLessonProgress.count({
          where: {
            userId: session.user.id,
            status: 'completed',
            lesson: {
              module: {
                journeyId: journey.journeyId,
              },
            },
          },
        });

        currentLesson = {
          id: journey.currentLesson.id,
          title: journey.currentLesson.title,
          moduleTitle: journey.currentModule.title,
          lessonNumber: journey.currentLesson.orderIndex,
        };

        journeyProgress = {
          completedCount: completedLessons,
          totalCount: totalLessons,
        };
      }
    } catch (error) {
      console.error("[learn] Failed to load progress:", error);
    }
  }

  // Create learning paths
  const starterPath = createStarterPath(completedNodeIds);

  const a2CompletedCount = Math.max(0, gameProgress.totalLessons - starterPathNodes.length);
  const a2CompletedIds = Array.from(
    { length: Math.min(a2CompletedCount, a2PathNodes.length) },
    (_, i) => `a2-${i + 1}`
  );
  const a2Path = createA2Path(a2CompletedIds);

  return (
    <LearnPageClient
      locale={locale}
      streak={gameProgress.streak}
      todayXP={gameProgress.todayXP}
      dailyGoalXP={gameProgress.dailyGoalXP}
      starterPath={starterPath}
      a2Path={a2Path}
      currentLesson={currentLesson}
      journeyProgress={journeyProgress}
    />
  );
}
