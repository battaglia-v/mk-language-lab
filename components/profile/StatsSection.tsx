import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type StatsSectionProps = {
  xp: { total: number; weekly: number };
  xpProgress: { percentComplete: number; xpInCurrentLevel: number; xpForNextLevel: number };
  streakDays: number;
  quests: { active: number; completedThisWeek: number };
  hearts: { current: number; max: number; isFull: boolean; minutesUntilNext: number };
  currency: { gems: number; coins: number };
  league: { tier: string; nextTier?: string | null; daysUntilNextTier?: number | null };
};

export function StatsSection({ xp, xpProgress, streakDays, quests, currency, league }: StatsSectionProps) {
  const t = useTranslations('profile.stats');

  return (
    <section className="glass-card rounded-3xl p-5 md:p-7 text-white" data-testid="profile-stats">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title={t('streak')} value={`${streakDays} ${t('days')}`} accent="from-orange-400/30 to-orange-500/10">
          <p className="text-sm text-slate-200">{t('leagueTier', { tier: league.tier })}</p>
        </StatCard>
        <StatCard title={t('activeQuests')} value={quests.active.toString()} accent="from-sky-400/30 to-sky-500/10">
          <p className="text-sm text-slate-200">{t('completedQuestsLabel', { count: quests.completedThisWeek })}</p>
        </StatCard>
        <StatCard title={t('currency')} value={`${currency.gems.toLocaleString()} 💎`} accent="from-amber-400/30 to-amber-500/10">
          <p className="text-sm text-slate-200">{t('currencyCaption')}</p>
        </StatCard>
        <StatCard title={t('weeklyXP')} value={xp.weekly.toLocaleString()} accent="from-emerald-400/30 to-emerald-500/10">
          <p className="text-sm text-slate-200">{t('totalXPCaption', { value: xp.total.toLocaleString() })}</p>
        </StatCard>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">{t('xpProgress')}</p>
            <span className="text-base text-white/90">{xpProgress.percentComplete}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              style={{ width: `${xpProgress.percentComplete}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-200">
            {t('xpProgressDetail', {
              current: xpProgress.xpInCurrentLevel,
              goal: xpProgress.xpForNextLevel,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  accent,
  children,
}: {
  title: string;
  value: string;
  accent: string;
  children?: React.ReactNode;
}) {
  return (
    <article
      className={cn('rounded-2xl border border-white/15 bg-gradient-to-br p-4', accent)}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-white/70">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {children}
    </article>
  );
}
