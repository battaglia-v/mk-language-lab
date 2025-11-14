'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Flame, MessageCircle, Sparkles, Target } from 'lucide-react';

// Dynamic import for QuickPracticeWidget to reduce initial bundle size
const QuickPracticeWidget = dynamic(
  () => import('@/components/learn/QuickPracticeWidget').then((mod) => ({ default: mod.QuickPracticeWidget })),
  {
    loading: () => <div className="h-[600px] animate-pulse rounded-[32px] bg-muted/50" />,
    ssr: false,
  },
);

type PracticeCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
};

export default function PracticeHubPage() {
  const t = useTranslations('practiceHub');
  const homeT = useTranslations('home');
  const locale = useLocale();

  const buildHref = useCallback(
    (path: string) => (path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`),
    [locale],
  );

  const directionLabel = locale === 'mk' ? 'МК → ЕН' : 'Mk → En';

  const heroStats = useMemo(
    () => [
      {
        icon: Flame,
        label: homeT('heroSection.streak', { count: 7 }),
      },
      {
        icon: Target,
        label: homeT('heroSection.xpProgress', { earned: 320, goal: 450 }),
      },
      {
        icon: MessageCircle,
        label: homeT('heroSection.translatorDirection', { direction: directionLabel }),
      },
    ],
    [homeT, directionLabel],
  );

const practiceSections = useMemo(
    () => [
      {
        key: 'translation',
        label: t('translation.tabLabel'),
        description: t('translation.description'),
        cards: [
          {
            title: t('translation.cards.translate.title'),
            description: t('translation.cards.translate.description'),
            href: buildHref('/translate'),
            icon: MessageCircle,
            accent: 'from-rose-500/20 to-pink-500/20',
          },
        ] satisfies PracticeCard[],
      },
    ],
    [t, buildHref],
  );

  return (
    <div className="page-shell">
      <div className="section-container section-container-xl section-spacing-md space-y-6 page-shell-content">
        <section
          data-testid="practice-hero"
          className="glass-card rounded-3xl p-6 md:p-8"
        >
          <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
            {t('badge')}
          </Badge>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white md:text-4xl">{t('title')}</h1>
              <p className="text-sm text-slate-300 md:text-base">{t('subtitle')}</p>
            </div>
            <Button
              asChild
              size="lg"
              className="rounded-full border border-white/20 bg-white/10 px-6 text-white hover:bg-white/20"
            >
              <Link href={buildHref('/translate')} className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('ctaTranslate')}
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/70 px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm"
                >
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div data-testid="practice-workspace" className="grid gap-6 lg:grid-cols-[minmax(0,2.25fr),minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="glass-card rounded-[32px] p-2">
              <QuickPracticeWidget
                className="rounded-[28px] border border-white/10 bg-[#04070f]/70"
                layout="default"
              />
            </div>

            {practiceSections.map((section) => (
              <div key={section.key} className="glass-card rounded-3xl p-5 shadow-lg md:p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">{section.label}</p>
                    <h2 className="text-xl font-semibold text-white">{section.description}</h2>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.cards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <Link
                        key={card.title}
                        href={card.href}
                        className="group block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                      >
                        <div
                          className={cn(
                            'mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-primary shadow-inner',
                            card.accent,
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <p className="text-base font-semibold text-white">{card.title}</p>
                        <p className="mt-1 text-sm text-slate-300">{card.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="glass-card rounded-3xl p-5 shadow-lg md:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {t('openAction')}
              </div>
              <p className="mt-3 text-xl font-semibold text-white">{t('cards.translate.title')}</p>
              <p className="text-sm text-slate-300">{t('cards.translate.description')}</p>
              <Button
                asChild
                className="mt-4 w-full rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href={buildHref('/translate')}>{t('openAction')}</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
