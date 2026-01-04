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

        const completedCount = Math.min(progress.totalLessons, starterPathNodes.length);
        completedNodeIds = Array.from(
          { length: completedCount },
          (_, i) => `node-${i + 1}`
        );
      }
    } catch (error) {
      console.error("[learn] Failed to load game progress:", error);
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
    />
  );
}
