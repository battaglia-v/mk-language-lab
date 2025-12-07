import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProgressRing } from "@/components/gamification/ProgressRing";
import { XPBar, getLevelInfo } from "@/components/gamification/XPBar";
import { StreakFlameCompact } from "@/components/gamification/StreakFlame";
import { HeartCounter } from "@/components/gamification/HeartCounter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, Sparkles, Newspaper, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Quick actions
  const quickActions = [
    {
      id: "translate",
      icon: Languages,
      path: "/translate",
      gradientFrom: "from-blue-500/10",
      gradientTo: "to-cyan-500/5",
      accentColor: "text-blue-400",
    },
    {
      id: "practice",
      icon: Sparkles,
      path: "/practice",
      gradientFrom: "from-amber-500/10",
      gradientTo: "to-yellow-500/5",
      accentColor: "text-amber-400",
    },
    {
      id: "news",
      icon: Newspaper,
      path: "/news",
      gradientFrom: "from-purple-500/10",
      gradientTo: "to-pink-500/5",
      accentColor: "text-purple-400",
    },
    {
      id: "resources",
      icon: BookOpen,
      path: "/resources",
      gradientFrom: "from-green-500/10",
      gradientTo: "to-emerald-500/5",
      accentColor: "text-green-400",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-24 sm:gap-5 sm:pb-6">
      {/* Compact Header with Stats */}
      <header className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <StreakFlameCompact streak={gameProgress.streak} />
          <HeartCounter hearts={gameProgress.hearts} variant="compact" size="sm" />
        </div>
        <div className="flex-1 px-2">
          <XPBar
            currentXP={levelInfo.currentXP}
            xpForNextLevel={levelInfo.xpForNextLevel}
            level={levelInfo.level}
            levelName={levelInfo.name}
            compact
          />
        </div>
      </header>

      {/* Daily Goal Ring */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{t("dailyGoal", { default: "Daily Goal" })}</CardTitle>
          <CardDescription>
            {t("dailyGoalDescription", {
              default: "Complete your daily goal to maintain your streak!",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <ProgressRing progress={dailyGoalProgress} size={120} strokeWidth={10}>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground">
                {gameProgress.todayXP}
              </span>
              <span className="text-xs text-muted-foreground">
                / {gameProgress.dailyGoalXP} XP
              </span>
            </div>
          </ProgressRing>
          <div className="flex-1 text-center sm:text-left">
            {dailyGoalProgress >= 100 ? (
              <>
                <p className="text-lg font-semibold text-success">
                  🎉 {t("goalComplete", { default: "Goal Complete!" })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("goalCompleteMessage", {
                    default: "Great work! Your streak is safe for today.",
                  })}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-foreground">
                  {t("keepGoing", { default: "Keep going!" })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("xpRemaining", {
                    default: `${gameProgress.dailyGoalXP - gameProgress.todayXP} XP to complete your goal`,
                    xp: gameProgress.dailyGoalXP - gameProgress.todayXP,
                  })}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Lesson / Start Learning */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t("continueLearning", { default: "Continue Learning" })}
          </CardTitle>
          <CardDescription>
            {gameProgress.totalLessons === 0
              ? t("startFirstLesson", { default: "Start your Macedonian language journey!" })
              : t("pickUpWhereLeft", { default: "Pick up where you left off" })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-accent-2 to-accent-3 text-lg font-bold text-black hover:opacity-90"
          >
            <Link href={`/${locale}/practice`}>
              {gameProgress.totalLessons === 0
                ? t("startLearning", { default: "Start Learning" })
                : t("continue", { default: "Continue" })}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          {t("quickActions", { default: "Quick Actions" })}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={`/${locale}${action.path}`}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:scale-[1.02] hover:border-border/80 active:scale-[0.98]"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100",
                    action.gradientFrom,
                    action.gradientTo
                  )}
                />
                <Icon className={cn("relative h-6 w-6", action.accentColor)} />
                <span className="relative text-sm font-medium text-foreground">
                  {navT(action.id)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <Card>
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
    </div>
  );
}
