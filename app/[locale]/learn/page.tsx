import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LearnPageClient } from "@/components/learn/LearnPageClient";
import { createStarterPath } from "@/lib/learn/starter-path";
import { createAdvancedPath } from "@/lib/learn/advanced-path";
import { create30DayChallengePath } from "@/lib/learn/challenge-30day-path";
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

  // Create all learning paths
  const starterPath = createStarterPath(completedNodeIds);

  // For advanced path, filter completed IDs that start with 'adv-'
  const advCompletedIds = completedNodeIds.filter(id => id.startsWith('adv-'));
  const advancedPath = createAdvancedPath(advCompletedIds);

  // For 30-day challenge, filter completed IDs that start with '30day-'
  const challengeCompletedIds = completedNodeIds.filter(id => id.startsWith('30day-'));
  const challengePath = create30DayChallengePath(challengeCompletedIds);

  const nextNode = getNextNode(starterPath);
  const continueHref = nextNode?.href ? `/${locale}${nextNode.href}` : `/${locale}/practice`;
  const nextLessonTitle = nextNode?.title || "Quick Practice";
  const nextLessonSubtitle = nextNode?.description || "Build your streak";

  return (
    <LearnPageClient
      locale={locale}
      streak={gameProgress.streak}
      todayXP={gameProgress.todayXP}
      dailyGoalXP={gameProgress.dailyGoalXP}
      totalLessons={gameProgress.totalLessons}
      continueHref={continueHref}
      nextLessonTitle={nextLessonTitle}
      nextLessonSubtitle={nextLessonSubtitle}
      starterPath={starterPath}
      advancedPath={advancedPath}
      challengePath={challengePath}
    />
  );
}
