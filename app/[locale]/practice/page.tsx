'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { BookOpenCheck, Flame, Headphones, MessageCircle, Mic2, Sparkles, Target } from 'lucide-react';

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

  const lessonHighlights = useMemo(
    () => [
      {
        title: t('cards.translate.title'),
        description: t('cards.translate.description'),
        href: buildHref('/translate'),
        icon: MessageCircle,
      },
      {
        title: t('cards.tasks.title'),
        description: t('cards.tasks.description'),
        href: buildHref('/tasks'),
        icon: BookOpenCheck,
      },
      {
        title: t('cards.tutor.title'),
        description: t('cards.tutor.description'),
        href: buildHref('/learn'),
        icon: Mic2,
      },
    ],
    [t, buildHref],
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
          {
            title: t('translation.cards.phrases.title'),
            description: t('translation.cards.phrases.description'),
            href: buildHref('/learn/phrases'),
            icon: BookOpenCheck,
            accent: 'from-amber-500/15 to-orange-500/25',
          },
        ] satisfies PracticeCard[],
      },
      {
        key: 'drills',
        label: t('drills.tabLabel'),
        description: t('drills.description'),
        cards: [
          {
            title: t('drills.cards.tasks.title'),
            description: t('drills.cards.tasks.description'),
            href: buildHref('/tasks'),
            icon: MessageCircle,
            accent: 'from-blue-500/15 to-cyan-500/25',
          },
          {
            title: t('drills.cards.vocabulary.title'),
            description: t('drills.cards.vocabulary.description'),
            href: buildHref('/learn/vocabulary'),
            icon: BookOpenCheck,
            accent: 'from-emerald-500/15 to-lime-500/20',
          },
        ] satisfies PracticeCard[],
      },
      {
        key: 'speaking',
        label: t('speaking.tabLabel'),
        description: t('speaking.description'),
        cards: [
          {
            title: t('speaking.cards.tutor.title'),
            description: t('speaking.cards.tutor.description'),
            href: buildHref('/learn'),
            icon: Mic2,
            accent: 'from-purple-500/15 to-indigo-500/25',
          },
          {
            title: t('speaking.cards.pronunciation.title'),
            description: t('speaking.cards.pronunciation.description'),
            href: buildHref('/learn/pronunciation'),
            icon: Headphones,
            accent: 'from-slate-500/15 to-slate-700/25',
          },
        ] satisfies PracticeCard[],
      },
    ],
    [t, buildHref],
  );

  return (
    <div className="section-container section-container-xl section-spacing-md space-y-6">
        <section
          data-testid="practice-hero"
          className="rounded-3xl border border-border/40 bg-gradient-to-br from-[var(--brand-red)]/15 via-background/80 to-background/40 p-6 shadow-lg backdrop-blur md:p-8"
        >
          <Badge variant="outline" className="w-fit border-primary/40 bg-primary/10 text-primary">
            {t('badge')}
          </Badge>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground md:text-4xl">{t('title')}</h1>
              <p className="text-sm text-muted-foreground md:text-base">{t('subtitle')}</p>
            </div>
            <Button asChild size="lg" className="rounded-full border border-border/50 bg-background/60 px-6">
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
            <div className="rounded-[32px] border border-border/40 bg-card/60 p-1.5 shadow-2xl">
              <QuickPracticeWidget
                className="rounded-[28px] border border-border/30 bg-gradient-to-br from-background/95 via-card/80 to-muted/60"
                layout="default"
              />
            </div>

            {practiceSections.map((section) => (
              <Card key={section.key} className="rounded-3xl border-border/40 bg-card/80 p-5 shadow-lg md:p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</p>
                    <h2 className="text-xl font-semibold text-foreground">{section.description}</h2>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {section.cards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <Link
                        key={card.title}
                        href={card.href}
                        className="group block rounded-2xl border border-border/40 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                      >
                        <div
                          className={cn(
                            'mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-primary shadow-inner',
                            card.accent,
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <p className="text-base font-semibold text-foreground">{card.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <aside className="space-y-6">
            <Card className="rounded-3xl border-border/40 bg-gradient-to-br from-primary/10 via-background/80 to-secondary/10 p-5 shadow-lg md:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {t('openAction')}
              </div>
              <p className="mt-3 text-xl font-semibold text-foreground">{t('cards.translate.title')}</p>
              <p className="text-sm text-muted-foreground">{t('cards.translate.description')}</p>
              <Button asChild className="mt-4 w-full rounded-2xl">
                <Link href={buildHref('/practice')}>{t('openAction')}</Link>
              </Button>
            </Card>

            <Card className="rounded-3xl border-border/40 bg-card/80 p-5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('cards.tasks.title')}</p>
                  <h3 className="text-lg font-semibold text-foreground">{t('cards.tasks.description')}</h3>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {lessonHighlights.map((lesson) => {
                  const Icon = lesson.icon;
                  return (
                    <Link
                      key={lesson.title}
                      href={lesson.href}
                      className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/70 p-3 transition hover:-translate-y-0.5 hover:border-primary/40"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </aside>
        </div>
    </div>
  );
}
