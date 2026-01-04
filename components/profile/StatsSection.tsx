import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type StatsSectionProps = {
  xp: { total: number; weekly: number };
  xpProgress: { percentComplete: number; xpInCurrentLevel: number; xpForNextLevel: number };
  streakDays: number;
};

export function StatsSection({ xp, xpProgress, streakDays }: StatsSectionProps) {
  const t = useTranslations('profile.stats');

  return (
    <section className="glass-card rounded-3xl p-5 md:p-7" data-testid="profile-stats">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard title={t('streak')} value={`${streakDays} ${t('days')}`} accent="from-orange-400/30 to-orange-500/10">
          <p className="text-sm text-muted-foreground">{t('keepItUp')}</p>
        </StatCard>
        <StatCard title={t('totalXP')} value={xp.total.toLocaleString()} accent="from-emerald-400/30 to-emerald-500/10">
          <p className="text-sm text-muted-foreground">{t('totalXPCaption', { value: xp.total.toLocaleString() })}</p>
        </StatCard>
        <div className="rounded-2xl border border-border bg-muted p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('xpProgress')}</p>
            <span className="text-base text-foreground">{xpProgress.percentComplete}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
              style={{ width: `${xpProgress.percentComplete}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
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
      className={cn('rounded-2xl border border-border bg-gradient-to-br p-4', accent)}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {children}
    </article>
  );
}
