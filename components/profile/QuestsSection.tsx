'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getQuestRoute, buildLocalizedRoute } from '@/lib/routes';

type Quest = {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  target: number;
  targetUnit: string;
  progress: number;
  progressPercent: number;
  status: string;
  xpReward: number;
  currencyReward: number;
  difficultyLevel: string;
  minutesRemaining: number | null;
  deadlineLabel: string | null;
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
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center">
            <div className="mx-auto max-w-md space-y-3">
              <h3 className="text-xl font-semibold text-white">Daily & Weekly Quests</h3>
              <p className="text-sm text-slate-200">
                Complete challenges to earn XP and gems. Check back soon for your first quests!
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Coming Soon
              </div>
            </div>
          </div>
        ) : (
          quests.map((quest: Quest) => (
            <article
              key={quest.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-primary/40"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{quest.title}</h3>
                    <Badge variant="outline" className="border-white/20 bg-white/10 text-xs uppercase tracking-wide">
                      {quest.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-200">{quest.description}</p>
                </div>
                <div className="flex flex-col items-start gap-2 text-xs text-slate-300">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {quest.difficultyLevel}
                  </span>
                  {quest.deadlineLabel ? <span>{quest.deadlineLabel}</span> : null}
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>
                    {quest.progress} / {quest.target} {quest.targetUnit}
                  </span>
                  <span className="font-semibold text-white">{quest.progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-rose-400"
                    style={{ width: `${quest.progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-4">
                  <span className="text-emerald-300">+{quest.xpReward} XP</span>
                  <span className="text-indigo-200">+{quest.currencyReward} gems</span>
                </div>
                <QuestCTA category={quest.category} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function QuestCTA({ category }: { category: string }) {
  const locale = useLocale();
  const href = buildLocalizedRoute(locale, getQuestRoute(category));
  return (
    <Button asChild size="sm" variant="secondary">
      <Link href={href}>Start</Link>
    </Button>
  );
}
