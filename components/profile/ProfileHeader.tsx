import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreakFlame } from '@/components/gamification/StreakFlame';

type ProfileHeaderProps = {
  name: string;
  level: string;
  xp: { total: number; weekly: number };
  streakDays: number;
  xpProgress: { percentComplete: number };
  hearts: { current: number; max: number; isFull: boolean; minutesUntilNext: number };
  className?: string;
};

export function ProfileHeader({
  name,
  level,
  xp,
  streakDays,
  xpProgress,
  className,
}: ProfileHeaderProps) {
  const t = useTranslations('profile');

  return (
    <section
      className={cn(
        'glass-card rounded-3xl p-6 md:p-8 shadow-lg',
        className
      )}
      data-testid="profile-overview"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">{t('title')}</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">{name}</h2>
          <p className="text-sm text-muted-foreground">{level}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatPill label={t('totalXP')} value={xp.total.toLocaleString()} accent="from-primary/40 to-primary/20" />
          <StatPill
            label={t('xpProgress')}
            value={`${xpProgress.percentComplete}%`}
            accent="from-rose-400/30 to-rose-500/10"
            sublabel={t('xpProgressCaption')}
          />
        </div>
      </div>

      {/* Streak + XP Badges Row */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* Streak Badge with StreakFlame */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-5 py-3">
          <StreakFlame streak={streakDays} size="md" showNumber={false} />
          <div>
            <p className="text-2xl font-bold text-foreground">{streakDays}</p>
            <p className="text-xs text-muted-foreground">{t('dayStreak')}</p>
          </div>
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-5 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
            <Star className="h-5 w-5 text-accent" fill="currentColor" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{xp.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('totalXP')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({
  label,
  value,
  accent,
  sublabel,
}: {
  label: string;
  value: string;
  accent: string;
  sublabel?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-gradient-to-br p-4 text-sm uppercase tracking-wide text-muted-foreground', accent)}>
      <p>{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
      {sublabel ? <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{sublabel}</p> : null}
    </div>
  );
}
