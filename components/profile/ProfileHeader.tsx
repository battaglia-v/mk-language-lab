import { useTranslations } from 'next-intl';

type ProfileHeaderProps = {
  name: string;
  level: string;
  xp: { total: number; weekly: number };
  streakDays: number;
};

export function ProfileHeader({ name, level, xp, streakDays }: ProfileHeaderProps) {
  const t = useTranslations('profile');

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{name}</h1>
          <p className="text-blue-100 text-lg">{level}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{xp.total.toLocaleString()}</div>
          <p className="text-blue-100">{t('totalXP')}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        <div>
          <div className="text-2xl font-bold">{streakDays}</div>
          <p className="text-blue-100">{t('dayStreak')}</p>
        </div>
        <div>
          <div className="text-2xl font-bold">{xp.weekly.toLocaleString()}</div>
          <p className="text-blue-100">{t('weeklyXP')}</p>
        </div>
      </div>
    </div>
  );
}
