import { Sparkles, Flame, Target, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent: string;
  subtext?: string;
};

function StatCard({ icon: Icon, label, value, accent, subtext }: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-background/80 to-background/60 p-3",
      "backdrop-blur-sm transition-all duration-200 hover:border-border/60 hover:shadow-lg"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </p>
          <p className="text-xl md:text-2xl font-bold text-foreground">
            {value}
          </p>
          {subtext && (
            <p className="text-[10px] text-muted-foreground">
              {subtext}
            </p>
          )}
        </div>
        <div className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
          accent
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

type StatsOverviewProps = {
  wordsLearned?: number;
  streakDays?: number;
  todayProgress?: number;
  lastPractice?: string;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export function StatsOverview({
  wordsLearned = 0,
  streakDays = 0,
  todayProgress = 0,
  lastPractice,
  t,
}: StatsOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {t("statsOverview")}
        </h2>
        {streakDays > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-3 py-1 text-sm font-bold text-orange-400 border border-orange-500/30">
            <Flame className="h-4 w-4" />
            <span>{streakDays} {t("dayStreak")}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard
          icon={Sparkles}
          label={t("wordsLearned")}
          value={wordsLearned}
          accent="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400"
        />
        <StatCard
          icon={Flame}
          label={t("currentStreak")}
          value={streakDays}
          accent="bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400"
          subtext={streakDays > 0 ? t("keepItUp") : undefined}
        />
        <StatCard
          icon={Target}
          label={t("todayGoal")}
          value={`${todayProgress}%`}
          accent="bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400"
        />
        <StatCard
          icon={Clock}
          label={t("lastPractice")}
          value={lastPractice || t("noPracticeYet")}
          accent="bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400"
        />
      </div>

      {todayProgress > 0 && todayProgress < 100 && (
        <div className="space-y-2 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">{t("dailyGoalProgress")}</span>
            <span className="font-bold text-primary">{todayProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
