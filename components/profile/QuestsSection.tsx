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

  const { data, isLoading, error } = useQuery<{ quests: Quest[] }>({
    queryKey: ['quests'],
    queryFn: async () => {
      const res = await fetch('/api/quests');
      if (!res.ok) throw new Error('Failed to fetch quests');
      return res.json();
    },
  });

  const quests = data?.quests || [];

  return (
    <section className="glass-card rounded-3xl p-6 md:p-8 text-white" data-testid="profile-quests">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div key={`quest-skeleton-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="h-4 w-1/3 rounded-full bg-white/10" />
              <div className="mt-2 h-3 w-2/3 rounded-full bg-white/5" />
              <div className="mt-4 h-2 w-full rounded-full bg-white/10" />
            </div>
          ))
        ) : error ? (
          <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-red-100">
            {error.message}
          </p>
        ) : quests.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-slate-200">
            {t('empty')}
          </p>
        ) : (
          quests.map((quest: Quest) => {
            const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
            return (
              <article
                key={quest.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-primary/40"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{quest.title}</h3>
                    <p className="text-sm text-slate-200">{quest.description}</p>
                  </div>
                  <span className="self-start rounded-full border border-primary/30 px-3 py-1 text-xs uppercase tracking-wide text-primary">
                    {quest.type}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>
                      {quest.progress} / {quest.target} {quest.targetUnit}
                    </span>
                    <span className="font-semibold text-white">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-rose-400"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-200">
                  <span className="text-emerald-300">+{quest.xpReward} XP</span>
                  <span className="text-indigo-200">+{quest.currencyReward} gems</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
