import { useTranslations } from 'next-intl';
import type { ProfileBadge } from '@mk/api-client';

type BadgesSectionProps = {
  badges: ProfileBadge[];
};

export function BadgesSection({ badges }: BadgesSectionProps) {
  const t = useTranslations('profile.badges');

  return (
    <section className="glass-card rounded-xl p-4 md:p-6 text-white" data-testid="profile-badges">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold md:text-xl">{t('title')}</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={`rounded-lg border p-3 text-center ${
              badge.earnedAt
                ? 'border-amber-300/60 bg-gradient-to-br from-amber-400/20 to-rose-400/10'
                : 'border-white/10 bg-white/5 opacity-60'
            }`}
          >
            <div className="text-3xl mb-2">{badge.earnedAt ? '🏆' : '🔒'}</div>
            <h3 className="text-sm font-semibold leading-tight">{badge.label}</h3>
            <p className="mt-1 text-xs text-slate-200 leading-snug">{badge.description}</p>
            {badge.earnedAt && (
              <p className="mt-2 text-xs text-slate-300">{new Date(badge.earnedAt).toLocaleDateString()}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
