import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getLevelInfo } from "@/lib/gamification/xp";
import { WordOfTheDay } from "@/components/learn/WordOfTheDay";
import {
  CompactStatBar,
  NextLessonCTA,
  QuickActionsGrid,
  SmartRecommendations
} from "@/components/dashboard";
import { PageContainer } from "@/components/layout";
import { GoalBar } from "@/components/ui/GoalBar";
import { StreakPill } from "@/components/ui/StreakPill";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LearnPage() {
  const locale = await getLocale();
  const t = await getTranslations("learn");
  const navT = await getTranslations("nav");

  const session = await auth().catch(() => null);

  let gameProgress = {
    xp: 0, streak: 0, hearts: 5, dailyGoalXP: 10, todayXP: 0, totalLessons: 0,
  };
  let levelInfo = getLevelInfo(0);

  if (session?.user?.id) {
    try {
      const progress = await prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      });
      if (progress) {
        gameProgress = {
          xp: progress.xp, streak: progress.streak, hearts: progress.hearts,
          dailyGoalXP: progress.dailyGoalXP || 10, todayXP: progress.todayXP, totalLessons: progress.totalLessons,
        };
        levelInfo = getLevelInfo(progress.xp);
      }
    } catch (error) {
      console.error("[learn] Failed to load game progress:", error);
    }
  }

  // Reduced quick actions - only core features
  const quickActions = [
    { id: "translate", iconName: "Languages", label: navT("translate"), href: "/translate", gradientFrom: "from-sky-500/16", gradientTo: "to-blue-500/8", accentColor: "text-blue-400" },
    { id: "practice", iconName: "Sparkles", label: navT("practice"), href: "/practice", gradientFrom: "from-amber-400/18", gradientTo: "to-orange-400/10", accentColor: "text-amber-400" },
    { id: "reader", iconName: "BookOpen", label: navT("reader"), href: "/reader", gradientFrom: "from-emerald-400/16", gradientTo: "to-teal-400/8", accentColor: "text-green-400" },
  ];

  return (
    <PageContainer size="xl" className="flex flex-col gap-4 pb-24 sm:gap-5 sm:pb-6">
      {/* 1. Continue CTA - FIRST and prominent */}
      <NextLessonCTA
        hasStartedLearning={gameProgress.totalLessons > 0}
        reviewCardsDue={0}
        locale={locale}
        t={{
          continueLearning: t("continueLearning"),
          startLearning: t("startLearning"),
          startFirstLesson: t("startFirstLesson"),
          pickUpWhereLeft: t("pickUpWhereLeft"),
          reviewDue: t("cardsRemaining", { count: 0 }),
          lessonProgress: t("dailyGoal"),
        }}
      />

      {/* 2. Goal + Streak - visible at glance */}
      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <GoalBar current={gameProgress.todayXP} goal={gameProgress.dailyGoalXP} className="flex-1" />
        <div className="flex items-center gap-3">
          <StreakPill days={gameProgress.streak} variant="highlight" />
          <span className="text-sm text-muted-foreground">Lvl {levelInfo.level}</span>
        </div>
      </div>

      {/* 3. Quick Actions - 3 core features only */}
      <QuickActionsGrid actions={quickActions} locale={locale} />

      {/* 4. Smart Recommendations */}
      <SmartRecommendations
        streak={gameProgress.streak}
        todayXP={gameProgress.todayXP}
        dailyGoalXP={gameProgress.dailyGoalXP}
        totalLessons={gameProgress.totalLessons}
        weakWordsCount={0}
        maxDisplay={2}
      />

      {/* 5. Word of the Day - lower priority */}
      <WordOfTheDay />

      {/* 6. Compact Stats - already shows key info */}
      <CompactStatBar
        streak={gameProgress.streak}
        hearts={gameProgress.hearts}
        maxHearts={5}
        currentXP={levelInfo.currentXP}
        xpForNextLevel={levelInfo.xpForNextLevel}
        level={levelInfo.level}
        levelName={levelInfo.name}
      />
    </PageContainer>
  );
}
