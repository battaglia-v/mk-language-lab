import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LearnPageClient } from "@/components/learn/LearnPageClient";
import { getA1Path, getA2Path, getB1Path } from "@/lib/learn/curriculum-path";
import { create30DayChallengePath } from "@/lib/learn/challenge-30day-path";

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
  };

  let currentLesson: { id: string; title: string; moduleTitle: string; lessonNumber: number } | undefined;
  let journeyProgress: { completedCount: number; totalCount: number } | undefined;
  const userId = session?.user?.id;

  if (userId) {
    try {
      // Fetch game progress
      const progress = await prisma.gameProgress.findUnique({
        where: { userId },
      });
      if (progress) {
        gameProgress = {
          xp: progress.xp,
          streak: progress.streak,
          dailyGoalXP: progress.dailyGoalXP || 20,
          todayXP: progress.todayXP,
        };
      }

      // Fetch journey progress for current curriculum position (Continue CTA)
      const journey = await prisma.journeyProgress.findFirst({
        where: { userId, isActive: true },
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
            userId,
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

  // Fetch curriculum paths from database (with user completion status if logged in)
  const [a1Path, a2Path, b1Path] = await Promise.all([
    getA1Path(userId),
    getA2Path(userId),
    getB1Path(userId),
  ]);

  // Get 30-day challenge progress (stored in localStorage, so empty for SSR)
  const challengePath = create30DayChallengePath([]);

  return (
    <LearnPageClient
      locale={locale}
      streak={gameProgress.streak}
      todayXP={gameProgress.todayXP}
      dailyGoalXP={gameProgress.dailyGoalXP}
      a1Path={a1Path}
      a2Path={a2Path}
      b1Path={b1Path}
      challengePath={challengePath}
      currentLesson={currentLesson}
      journeyProgress={journeyProgress}
    />
  );
}
