'use client';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export type ShopBadge = {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  rarityTier: string;
  costGems: number;
  isOwned: boolean;
};

type BadgeShopResponse = {
  badges: ShopBadge[];
  currency: { gems: number; coins: number };
};

type BadgeShopPreviewProps = {
  className?: string;
};

export function BadgeShopPreview({ className }: BadgeShopPreviewProps) {
  const t = useTranslations('profile.badgeShop');
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<BadgeShopResponse>({
    queryKey: ['badge-shop'],
    queryFn: async () => {
      const res = await fetch('/api/badges/shop');
      if (!res.ok) throw new Error('Failed to load badge shop');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const res = await fetch('/api/badges/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Purchase failed');
      }
      return res.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['badge-shop'] });
      addToast({
        type: 'success',
        title: t('success.title'),
        description: t('success.description'),
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: t('error.title'),
        description: err.message,
      });
    },
  });

  const featuredBadges = useMemo(() => data?.badges.slice(0, 3) ?? [], [data?.badges]);

  return (
    <section className={cn('glass-card rounded-3xl p-6 md:p-8 text-white', className)} data-testid="badge-shop">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">{t('title')}</p>
          <h2 className="text-2xl font-semibold">{t('subtitle')}</h2>
          <p className="text-sm text-slate-200">{t('description')}</p>
        </div>
        {data ? (
          <div className="text-right text-sm text-amber-200">
            <p className="font-semibold">
              {t('balance', { gems: data.currency.gems.toLocaleString() })}
            </p>
            <p className="text-xs text-slate-300">{t('balanceCaption')}</p>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`badge-skeleton-${index}`} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-red-100">
          {t('error.description')}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredBadges.map((badge) => (
            <article
              key={badge.id}
              className={cn(
                'rounded-2xl border p-4 text-center shadow-inner',
                badge.isOwned
                  ? 'border-emerald-300/50 bg-emerald-500/10'
                  : 'border-white/10 bg-white/5'
              )}
            >
              <div className="text-4xl mb-2">{badge.iconUrl ? '🧿' : '✨'}</div>
              <h3 className="text-base font-semibold">{badge.name}</h3>
              <p className="mt-1 text-xs text-slate-200 line-clamp-3">{badge.description}</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-200">
                <Badge variant="outline" className="border-amber-200/40 bg-amber-200/10 text-amber-100">
                  {t('rarity.' + badge.rarityTier, { defaultValue: badge.rarityTier })}
                </Badge>
                <span>·</span>
                <span>{t('cost', { gems: badge.costGems })}</span>
              </div>
              <Button
                size="sm"
                className="mt-4 w-full"
                variant={badge.isOwned ? 'secondary' : 'default'}
                disabled={badge.isOwned || mutation.isPending}
                onClick={() => mutation.mutate(badge.id)}
              >
                {badge.isOwned ? t('owned') : t('purchase')}
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
