import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getLevelInfo } from "@/lib/gamification/xp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WordOfTheDay } from "@/components/learn/WordOfTheDay";
import {
  CompactStatBar,
  DailyGoalCard,
  NextLessonCTA,
  QuickActionsGrid,
  GoalCompleteCard,
  SmartRecommendations
} from "@/components/dashboard";
import { PageContainer } from "@/components/layout";

// Force dynamic rendering to ensure fresh data and proper auth checks
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LearnPage() {
  const locale = await getLocale();
  const t = await getTranslations("learn");
  const navT = await getTranslations("nav");

  // Fetch user data
  const session = await auth().catch(() => null);

  // Default values
  let gameProgress = {
    xp: 0,
    streak: 0,
    hearts: 5,
    dailyGoalXP: 20,
    todayXP: 0,
    totalLessons: 0,
  };

  let levelInfo = getLevelInfo(0);

  if (session?.user?.id) {
    try {
      const progress = await prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      });

      if (progress) {
        gameProgress = {
          xp: progress.xp,
          streak: progress.streak,
          hearts: progress.hearts,
          dailyGoalXP: progress.dailyGoalXP,
          todayXP: progress.todayXP,
          totalLessons: progress.totalLessons,
        };

        levelInfo = getLevelInfo(progress.xp);
      }
    } catch (error) {
      console.error("[learn] Failed to load game progress:", error);
    }
  }

  // Calculate daily goal progress with safety check
  const dailyGoalProgress = gameProgress.dailyGoalXP > 0
    ? Math.min((gameProgress.todayXP / gameProgress.dailyGoalXP) * 100, 100)
    : 0;

  // Quick actions for the grid - use iconName strings for RSC serialization
  const quickActions = [
    {
      id: "translate",
      iconName: "Languages",
      label: navT("translate"),
      href: "/translate",
      gradientFrom: "from-sky-500/16",
      gradientTo: "to-blue-500/8",
      accentColor: "text-blue-400",
    },
    {
      id: "practice",
      iconName: "Sparkles",
      label: navT("practice"),
      href: "/practice",
      gradientFrom: "from-amber-400/18",
      gradientTo: "to-orange-400/10",
      accentColor: "text-amber-400",
    },
    {
      id: "news",
      iconName: "Newspaper",
      label: navT("news"),
      href: "/news",
      gradientFrom: "from-purple-400/16",
      gradientTo: "to-pink-400/10",
      accentColor: "text-purple-400",
    },
    {
      id: "resources",
      iconName: "BookOpen",
      label: navT("resources"),
      href: "/resources",
      gradientFrom: "from-emerald-400/16",
      gradientTo: "to-teal-400/8",
      accentColor: "text-green-400",
    },
    {
      id: "about",
      iconName: "Info",
      label: navT("about"),
      href: "/about",
      gradientFrom: "from-slate-300/14",
      gradientTo: "to-slate-500/8",
      accentColor: "text-slate-200",
    },
  ];

  return (
    <PageContainer size="xl" className="flex flex-col gap-4 pb-24 sm:gap-5 sm:pb-6">
      {/* V2: Compact Header with Stats */}
      <CompactStatBar
        streak={gameProgress.streak}
        hearts={gameProgress.hearts}
        maxHearts={5}
        currentXP={levelInfo.currentXP}
        xpForNextLevel={levelInfo.xpForNextLevel}
        level={levelInfo.level}
        levelName={levelInfo.name}
      />

      {/* Daily Goal + Word of the Day */}
      <div className="grid gap-4 sm:grid-cols-2">
        {dailyGoalProgress >= 100 ? (
          <GoalCompleteCard
            xpEarned={gameProgress.todayXP}
            xpGoal={gameProgress.dailyGoalXP}
            streakDays={gameProgress.streak}
            t={{
              doneForToday: t("goalComplete"),
              streakProtected: t("goalCompleteMessage"),
              comeBackTomorrow: t("keepGoing"),
              shareStreak: navT("quickActionPractice"),
              keepPracticing: t("continue"),
              xpEarned: `+${gameProgress.todayXP} XP`,
            }}
          />
        ) : (
          <DailyGoalCard
            todayXP={gameProgress.todayXP}
            dailyGoalXP={gameProgress.dailyGoalXP}
            t={{
              dailyGoal: t("dailyGoal"),
              description: t("dailyGoalDescription"),
              keepGoing: t("keepGoing"),
              xpRemaining: t("xpRemaining", { xp: gameProgress.dailyGoalXP - gameProgress.todayXP }),
              goalComplete: t("goalComplete"),
              goalCompleteMessage: t("goalCompleteMessage"),
              continueLesson: t("continue"),
              keepPracticing: t("keepGoing"),
            }}
          />
        )}
        <WordOfTheDay />
      </div>

      {/* V2: Next Lesson CTA */}
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

      {/* V2: Smart Recommendations */}
      <SmartRecommendations
        streak={gameProgress.streak}
        todayXP={gameProgress.todayXP}
        dailyGoalXP={gameProgress.dailyGoalXP}
        totalLessons={gameProgress.totalLessons}
        weakWordsCount={0}
        maxDisplay={2}
      />

      {/* V2: Quick Actions Grid */}
      <QuickActionsGrid
        actions={quickActions}
        locale={locale}
      />

      {/* Stats Overview */}
      <Card className="border-white/8 bg-white/5 shadow-[0_12px_36px_rgba(0,0,0,0.45)]">
        <CardHeader>
          <CardTitle>{t("yourProgress", { default: "Your Progress" })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{gameProgress.totalLessons}</p>
              <p className="text-xs text-muted-foreground">
                {t("lessonsCompleted", { default: "Lessons" })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{gameProgress.xp}</p>
              <p className="text-xs text-muted-foreground">{t("totalXP", { default: "Total XP" })}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{gameProgress.streak}</p>
              <p className="text-xs text-muted-foreground">
                {t("dayStreak", { default: "Day Streak" })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{levelInfo.level}</p>
              <p className="text-xs text-muted-foreground">{t("level", { default: "Level" })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
