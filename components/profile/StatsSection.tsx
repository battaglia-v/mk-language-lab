import { useTranslations } from 'next-intl';

type StatsSectionProps = {
  xp: { total: number; weekly: number };
  streakDays: number;
  quests: { active: number; completedThisWeek: number };
};

export function StatsSection({ xp, streakDays, quests }: StatsSectionProps) {
  const t = useTranslations('profile.stats');

  const stats = [
    { label: t('totalXP'), value: xp.total.toLocaleString(), color: 'bg-blue-500' },
    { label: t('weeklyXP'), value: xp.weekly.toLocaleString(), color: 'bg-green-500' },
    { label: t('streak'), value: `${streakDays} ${t('days')}`, color: 'bg-orange-500' },
    { label: t('activeQuests'), value: quests.active, color: 'bg-purple-500' },
    { label: t('completedQuests'), value: quests.completedThisWeek, color: 'bg-pink-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
          <div className={`${stat.color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl`}>
            {typeof stat.value === 'number' ? stat.value : stat.value.split(' ')[0]}
          </div>
          <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
