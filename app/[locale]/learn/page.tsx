import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LearnHeader } from "@/components/learn/LearnHeader";
import { LessonPath } from "@/components/learn/LessonPath";
import { createStarterPath } from "@/lib/learn/starter-path";
import { getNextNode } from "@/lib/learn/lesson-path-types";

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

  // Track completed node IDs (MVP: stored in a simple way, future: in DB)
  let completedNodeIds: string[] = [];

  if (session?.user?.id) {
    try {
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

        // MVP: Mark nodes as completed based on totalLessons
        // In production, this would come from a dedicated lesson progress table
        const completedCount = Math.min(progress.totalLessons, 10);
        completedNodeIds = Array.from(
          { length: completedCount },
          (_, i) => `node-${i + 1}`
        );
      }
    } catch (error) {
      console.error("[learn] Failed to load game progress:", error);
    }
  }

  // Create the lesson path with user's progress
  const starterPath = createStarterPath(completedNodeIds);
  const nextNode = getNextNode(starterPath);
  const continueHref = nextNode?.href ? `/${locale}${nextNode.href}` : undefined;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] pb-24 sm:pb-6">
      {/* Sticky header with streak + daily goal + Continue */}
      <LearnHeader
        streak={gameProgress.streak}
        todayXP={gameProgress.todayXP}
        dailyGoalXP={gameProgress.dailyGoalXP}
        continueHref={continueHref}
        locale={locale}
      />

      {/* Lesson Path */}
      <div className="flex-1 pt-6">
        <LessonPath path={starterPath} locale={locale} />
      </div>
    </div>
  );
}
