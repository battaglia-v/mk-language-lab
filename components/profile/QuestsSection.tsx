'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

type Quest = {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  target: number;
  targetUnit: string;
  progress: number;
  status: string;
  xpReward: number;
  currencyReward: number;
  difficultyLevel: string;
};

export function QuestsSection() {
  const t = useTranslations('profile.quests');

  const { data } = useQuery<{ quests: Quest[] }>({
    queryKey: ['quests'],
    queryFn: async () => {
      const res = await fetch('/api/quests');
      if (!res.ok) throw new Error('Failed to fetch quests');
      return res.json();
    },
  });

  const quests = data?.quests || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h2>

      <div className="space-y-4">
        {quests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{t('empty')}</p>
        ) : (
          quests.map((quest: Quest) => (
            <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{quest.title}</h3>
                  <p className="text-sm text-gray-600">{quest.description}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                  {quest.type}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {quest.progress} / {quest.target} {quest.targetUnit}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {Math.round((quest.progress / quest.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-green-600">+{quest.xpReward} XP</span>
                <span className="text-purple-600">+{quest.currencyReward} gems</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
