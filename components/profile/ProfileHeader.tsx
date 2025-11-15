import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type ProfileHeaderProps = {
  name: string;
  level: string;
  xp: { total: number; weekly: number };
  streakDays: number;
  className?: string;
};

export function ProfileHeader({ name, level, xp, streakDays, className }: ProfileHeaderProps) {
  const t = useTranslations('profile');

  return (
    <section
      className={cn(
        'glass-card rounded-3xl p-6 md:p-8 text-white shadow-[0_35px_70px_-40px_rgba(0,0,0,0.9)]',
        className
      )}
      data-testid="profile-overview"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">{t('title')}</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">{name}</h2>
          <p className="text-sm text-slate-300">{level}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatPill label={t('totalXP')} value={xp.total.toLocaleString()} accent="from-primary/40 to-primary/20" />
          <StatPill label={t('weeklyXP')} value={xp.weekly.toLocaleString()} accent="from-emerald-400/40 to-emerald-500/10" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-300">{t('dayStreak')}</p>
          <p className="text-3xl font-bold">{streakDays}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-300">{t('weeklyXP')}</p>
          <p className="text-3xl font-bold">{xp.weekly.toLocaleString()}</p>
        </div>
      </div>
    </section>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-white/15 bg-gradient-to-br p-4 text-sm uppercase tracking-wide text-white/80', accent)}>
      <p>{label}</p>
      <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
