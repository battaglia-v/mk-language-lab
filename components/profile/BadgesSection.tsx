import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ProfileBadge } from '@mk/api-client';

type BadgesSectionProps = {
  badges: ProfileBadge[];
};

export function BadgesSection({ badges }: BadgesSectionProps) {
  const t = useTranslations('profile.badges');

  return (
    <section className="glass-card rounded-3xl p-6 md:p-8 text-white" data-testid="profile-badges">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <Link
          href="/shop"
          className="text-sm font-semibold text-primary hover:text-primary/80"
        >
          {t('shopLink')} →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((badge) => (
          <article
            key={badge.id}
            className={`rounded-2xl border p-4 text-center ${
              badge.earnedAt
                ? 'border-amber-300/60 bg-gradient-to-br from-amber-400/20 to-rose-400/10'
                : 'border-white/10 bg-white/5 opacity-70'
            }`}
          >
            <div className="text-4xl mb-2">{badge.earnedAt ? '🏆' : '🔒'}</div>
            <h3 className="text-sm font-semibold">{badge.label}</h3>
            <p className="text-xs text-slate-200">{badge.description}</p>
            {badge.earnedAt && (
              <p className="mt-2 text-xs text-slate-300">{new Date(badge.earnedAt).toLocaleDateString()}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
