import { Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LeagueStandings } from '@mk/api-client';
import { cn } from '@/lib/utils';

type LeagueStandingsCardProps = {
  data?: LeagueStandings;
  isLoading?: boolean;
  error?: Error | null;
};

export function LeagueStandingsCard({ data, isLoading, error }: LeagueStandingsCardProps) {
  const t = useTranslations('profile.league');

  if (isLoading) {
    return (
      <section className="glass-card rounded-3xl p-6 md:p-8" data-testid="league-standings-skeleton">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded-full bg-white/10" />
          <div className="h-4 w-1/2 rounded-full bg-white/5" />
          <div className="h-24 rounded-2xl bg-white/5" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="glass-card rounded-3xl border border-destructive/40 p-6 text-white" data-testid="league-standings-error">
        <p className="text-sm text-red-100">{error.message}</p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const topMembers = data.members.slice(0, 6);

  return (
    <section className="glass-card rounded-3xl p-6 md:p-8 text-white" data-testid="league-standings">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-primary/80">
            <Trophy className="h-5 w-5 text-primary" aria-hidden />
            <span>{t('title')}</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold">{data.tierLabel}</h2>
          <p className="text-sm text-slate-200">
            {t('rankLabel', { rank: data.rank ?? '—', tier: data.tierLabel })}
          </p>
          <p className="text-xs text-slate-400">{t('streakLabel', { days: data.streakDays })}</p>
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-slate-200 flex-wrap gap-2">
            <span>{t('promotionLabel', { cutoff: data.promotionCutoff })}</span>
            {data.demotionCutoff ? <span>{t('demotionLabel', { cutoff: data.demotionCutoff })}</span> : null}
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-300"
              style={{ width: `${data.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-200/80">{t('progressLabel', { percent: data.progressPercent })}</p>
        </div>
      </div>

      <ol className="mt-6 space-y-3" data-testid="league-standings-list">
        {topMembers.map((member) => (
          <li
            key={member.id}
            className={cn(
              'flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3',
              member.isCurrentUser && 'border-primary/60 bg-primary/15'
            )}
          >
            <div>
              <p className="text-sm font-semibold text-white">
                {member.rank}. {member.name}
              </p>
              <p className="text-xs text-slate-200/80">
                {t('memberStats', { streak: member.streakDays, xp: member.xp.toLocaleString() })}
              </p>
            </div>
            <span className="text-xs uppercase tracking-wide text-slate-200/70">
              {member.isCurrentUser ? t('youLabel') : t(`trend.${member.trend ?? 'neutral'}`)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
