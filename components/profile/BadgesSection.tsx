import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ProfileBadge } from '@mk/api-client';

type BadgesSectionProps = {
  badges: ProfileBadge[];
};

export function BadgesSection({ badges }: BadgesSectionProps) {
  const t = useTranslations('profile.badges');

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <Link
          href="/shop"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          {t('shopLink')} →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`border rounded-lg p-4 ${
              badge.earnedAt
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            <div className="text-4xl mb-2 text-center">
              {badge.earnedAt ? '🏆' : '🔒'}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm text-center mb-1">
              {badge.label}
            </h3>
            <p className="text-xs text-gray-600 text-center">
              {badge.description}
            </p>
            {badge.earnedAt && (
              <p className="text-xs text-gray-500 text-center mt-2">
                {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
