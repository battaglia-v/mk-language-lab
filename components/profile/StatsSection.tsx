import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type StatsSectionProps = {
  xp: { total: number; weekly: number };
  streakDays: number;
  quests: { active: number; completedThisWeek: number };
};

export function StatsSection({ xp, streakDays, quests }: StatsSectionProps) {
  const t = useTranslations('profile.stats');

  const stats = [
    { label: t('totalXP'), value: xp.total.toLocaleString(), accent: 'from-primary/30 to-primary/10' },
    { label: t('weeklyXP'), value: xp.weekly.toLocaleString(), accent: 'from-emerald-400/30 to-emerald-500/10' },
    { label: t('streak'), value: `${streakDays} ${t('days')}`, accent: 'from-orange-400/30 to-orange-500/10' },
    { label: t('activeQuests'), value: quests.active.toString(), accent: 'from-sky-400/30 to-sky-500/10' },
    { label: t('completedQuests'), value: quests.completedThisWeek.toString(), accent: 'from-pink-400/30 to-pink-500/10' },
  ];

  return (
    <section className="glass-card rounded-3xl p-6 md:p-8 text-white" data-testid="profile-stats">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={cn(
              'rounded-2xl border border-white/15 bg-gradient-to-br p-4 text-center',
              stat.accent
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
