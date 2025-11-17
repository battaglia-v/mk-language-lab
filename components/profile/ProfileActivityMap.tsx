'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ProfileSummary } from '@mk/api-client';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<ProfileSummary['activityHeatmap'][number]['status'], string> = {
  complete: 'bg-emerald-400/80 border-emerald-200/70',
  partial: 'bg-amber-300/70 border-amber-100/60',
  missed: 'bg-slate-600/50 border-white/10',
};

const STATUS_KEYS: Array<ProfileSummary['activityHeatmap'][number]['status']> = [
  'complete',
  'partial',
  'missed',
];

type ProfileActivityMapProps = {
  entries: ProfileSummary['activityHeatmap'];
};

export function ProfileActivityMap({ entries }: ProfileActivityMapProps) {
  const t = useTranslations('profile.activity');
  const weeks = useMemo(() => chunkByWeek(entries), [entries]);
  const completedDays = entries.filter((entry) => entry.status !== 'missed').length;
  const totalXP = entries.reduce((sum, entry) => sum + entry.xp, 0);

  return (
    <section className="glass-card rounded-3xl p-6 md:p-8 text-white" data-testid="profile-activity-map">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <p className="text-sm text-slate-200">{t('subtitle')}</p>
          <p className="mt-2 text-xs text-slate-200/90">
            {t('summary', { completed: completedDays, total: entries.length })}
          </p>
          <p className="text-xs text-slate-200/90">{t('xpLabel', { value: totalXP.toLocaleString() })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200">
          {STATUS_KEYS.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <span className={cn('h-3 w-3 rounded-sm border', STATUS_STYLES[status])} aria-hidden />
              <span>{t(`legend.${status}`)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="grid auto-cols-max grid-flow-col gap-3" role="grid">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-2" role="rowgroup">
              {week.map((day, dayIndex) => (
                <div key={day.date} role="row" className="contents">
                  <button
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-lg border transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                      STATUS_STYLES[day.status]
                    )}
                    title={t('tooltip', {
                      date: new Date(day.date).toLocaleDateString(),
                      xp: day.xp,
                      minutes: day.practiceMinutes,
                    })}
                    aria-label={t('tooltip', {
                      date: new Date(day.date).toLocaleDateString(),
                      xp: day.xp,
                      minutes: day.practiceMinutes,
                    })}
                    data-testid={`activity-${weekIndex}-${dayIndex}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function chunkByWeek(entries: ProfileSummary['activityHeatmap']) {
  const chunks: ProfileSummary['activityHeatmap'][] = [];
  for (let i = 0; i < entries.length; i += 7) {
    chunks.push(entries.slice(i, i + 7));
  }
  return chunks;
}
