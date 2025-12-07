import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Languages, Sparkles, Newspaper, BookOpen, CircleUserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildLocalizedHref } from "@/components/shell/navItems";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

type ActionConfig = {
  id: "translate" | "practice" | "news" | "resources" | "profile";
  icon: LucideIcon;
  path: string;
  mobileHidden?: boolean;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  getDescription: (deps: { homeT: Translator; profileT: Translator }) => string;
};

const ACTIONS: ActionConfig[] = [
  {
    id: "translate",
    icon: Languages,
    path: "/translate",
    gradientFrom: "from-blue-500/10",
    gradientTo: "to-cyan-500/5",
    accentColor: "text-blue-400",
    getDescription: ({ homeT }) => homeT("translateFeatureDescription"),
  },
  {
    id: "practice",
    icon: Sparkles,
    path: "/practice",
    gradientFrom: "from-amber-500/10",
    gradientTo: "to-yellow-500/5",
    accentColor: "text-amber-400",
    getDescription: ({ homeT }) => homeT("actionCards.continue.description"),
  },
  {
    id: "news",
    icon: Newspaper,
    path: "/news",
    mobileHidden: true,
    gradientFrom: "from-purple-500/10",
    gradientTo: "to-pink-500/5",
    accentColor: "text-purple-400",
    getDescription: ({ homeT }) => homeT("newsFeatureDescription"),
  },
  {
    id: "resources",
    icon: BookOpen,
    path: "/resources",
    mobileHidden: true,
    gradientFrom: "from-green-500/10",
    gradientTo: "to-emerald-500/5",
    accentColor: "text-green-400",
    getDescription: ({ homeT }) => homeT("resourcesFeatureDescription"),
  },
  {
    id: "profile",
    icon: CircleUserRound,
    path: "/profile",
    mobileHidden: true,
    gradientFrom: "from-slate-500/10",
    gradientTo: "to-gray-500/5",
    accentColor: "text-slate-400",
    getDescription: ({ profileT }) => profileT("profile"),
  },
];

export default async function DashboardPage() {
  const locale = await getLocale();
  const navT = await getTranslations("nav");
  const homeT = await getTranslations("home");
  const profileT = await getTranslations("shell");

  // Fetch real user data from database
  const session = await auth().catch(() => null);
  let userStats = {
    wordsLearned: 0,
    streakDays: 0,
    todayProgress: 0,
    lastPractice: homeT("noPracticeYet") as string,
  };

  if (session?.user?.id) {
    try {
      const gameProgress = await prisma.gameProgress.findUnique({
        where: { userId: session.user.id },
      });

      if (gameProgress) {
        // Calculate words learned from XP (12 XP per word reviewed)
        const wordsLearned = Math.floor((gameProgress.xp || 0) / 12);

        // Get streak
        const streakDays = gameProgress.streak || 0;

        // Calculate today's progress (percentage toward daily goal of 10 XP)
        const dailyGoal = 10;
        const todayXP = gameProgress.xp || 0; // In production, this should track today's XP only
        const todayProgress = Math.min(100, Math.round((todayXP % dailyGoal) / dailyGoal * 100));

        // Format last practice date
        let lastPractice = homeT("noPracticeYet") as string;
        if (gameProgress.lastPracticeDate) {
          const lastDate = new Date(gameProgress.lastPracticeDate);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            lastPractice = homeT("today") as string;
          } else if (diffDays === 1) {
            lastPractice = homeT("yesterday") as string || "Yesterday";
          } else {
            lastPractice = `${diffDays} days ago`;
          }
        }

        userStats = {
          wordsLearned,
          streakDays,
          todayProgress,
          lastPractice,
        };
      }
    } catch (error) {
      console.error('[dashboard] Failed to load user stats:', error);
      // Fall back to default values
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
      <header className="page-header">
        <div className="page-header-content">
          <p className="page-header-badge">{navT("home")}</p>
          <h1 className="page-header-title">{navT("dashboard")}</h1>
          <p className="page-header-subtitle">{homeT("subtitle")}</p>
        </div>
      </header>

      <StatsOverview
        wordsLearned={userStats.wordsLearned}
        streakDays={userStats.streakDays}
        todayProgress={userStats.todayProgress}
        lastPractice={userStats.lastPractice}
        t={(key: string, values?: Record<string, string | number>) => homeT(key, values)}
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const description = action.getDescription({ homeT, profileT });
          const href = buildLocalizedHref(locale, action.path);
          return (
            <Card
              key={action.id}
              className={cn(
                "group relative overflow-hidden flex h-full flex-col border border-border/50 shadow-sm transition-all duration-200",
                action.mobileHidden && "hidden md:flex",
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-40",
                action.gradientFrom,
                action.gradientTo
              )} />
              <CardHeader className="relative flex-1 space-y-2">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/40 bg-background/60 backdrop-blur-sm px-2.5 py-1 text-xs">
                  <Icon className={cn("h-3.5 w-3.5", action.accentColor)} aria-hidden />
                  <span className="font-semibold text-foreground">{navT(action.id)}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground">{navT(action.id)}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative pt-0">
                <Button asChild className="w-full justify-center font-bold !text-black" size="default">
                  <Link href={href}>{navT(action.id)}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
