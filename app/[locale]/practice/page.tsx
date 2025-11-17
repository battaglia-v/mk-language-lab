'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Flame, MessageCircle, Sparkles, Target } from 'lucide-react';
import { useSavedPhrases } from '@/components/translate/useSavedPhrases';
import { CollapsiblePanel } from '@/components/layout/CollapsiblePanel';

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
  const searchParams = useSearchParams();
  const { phrases } = useSavedPhrases();
  const savedDeckActive = searchParams?.get('practiceFixture') === 'saved-phrases';
  const hasSavedPhrases = phrases.length > 0;

  const buildHref = useCallback(
    (path: string) => (path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`),
    [locale],
  );
  const translatorSavedHref = buildHref('/translate?panel=saved');

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
            accent: 'bg-[#f8f5ed] text-primary',
          },
        ] satisfies PracticeCard[],
      },
    ],
    [t, buildHref],
  );

  const ctaRailCards = useMemo(
    () => [
      {
        title: t('cards.translate.title'),
        description: t('cards.translate.description'),
        href: buildHref('/translate'),
        icon: MessageCircle,
      },
      {
        title: t('savedDeck.title'),
        description: hasSavedPhrases ? t('savedDeck.description') : t('savedDeck.emptyDescription'),
        href: translatorSavedHref,
        icon: Sparkles,
      },
    ],
    [t, buildHref, translatorSavedHref, hasSavedPhrases],
  );

  const savedDeckBanner = savedDeckActive ? (
    <Alert className="mb-4 rounded-2xl border-[var(--fold-border)] bg-white text-foreground">
      <AlertTitle className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {t('savedDeck.badge')}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-lg font-semibold text-foreground">{t('savedDeck.title')}</p>
        <p className="text-sm text-muted-foreground">
          {hasSavedPhrases ? t('savedDeck.description') : t('savedDeck.emptyDescription')}
        </p>
        <Button asChild variant="secondary" className="rounded-full text-sm font-semibold">
          <Link href={translatorSavedHref}>{t('savedDeck.manageCta')}</Link>
        </Button>
      </AlertDescription>
    </Alert>
  ) : null;

  return (
    <div className="minimal-shell">
      <div className="minimal-shell-content section-container section-container-wide section-spacing-xl space-y-4">
        <section data-testid="practice-hero" className="fold-grid">
          <div className="neutral-panel space-y-6">
            <Badge variant="outline" className="w-fit rounded-full border border-[var(--fold-border)] bg-white/70 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {t('badge')}
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground md:text-[2.5rem]">{t('title')}</h1>
              <p className="text-base text-muted-foreground">{t('subtitle')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--fold-border)] bg-white px-4 py-3 text-sm font-medium text-muted-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{stat.label}</span>
                  </div>
                );
              })}
            </div>
            <Button asChild size="lg" className="w-fit rounded-full px-6">
              <Link href={buildHref('/translate')} className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {t('ctaTranslate')}
              </Link>
            </Button>
          </div>
          <PracticeCtaRail cards={ctaRailCards} ctaLabel={t('openAction')} />
        </section>

        <CollapsiblePanel
          eyebrow={t('savedDeck.badge')}
          title={t('savedDeck.title')}
          description={t('savedDeck.description')}
          defaultOpen
        >
          <div className="neutral-panel neutral-panel-muted">
            {savedDeckBanner}
            <QuickPracticeWidget className="rounded-[24px] border border-[var(--fold-border)] bg-white" layout="default" />
          </div>
        </CollapsiblePanel>

        {practiceSections.map((section) => (
          <CollapsiblePanel key={section.key} eyebrow={section.label} title={section.description}>
            <div className="grid gap-3 md:grid-cols-2">
              {section.cards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="group rounded-2xl border border-[var(--fold-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-primary', card.accent)}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="text-base font-semibold text-foreground">{card.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
                  </Link>
                );
              })}
            </div>
          </CollapsiblePanel>
        ))}
      </div>
    </div>
  );
}

function PracticeCtaRail({
  cards,
  ctaLabel,
}: {
  cards: { title: string; description: string; href: string; icon: LucideIcon }[];
  ctaLabel: string;
}) {
  return (
    <aside className="neutral-panel neutral-panel-muted cta-rail" aria-label="Practice quick actions">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="rounded-2xl border border-dashed border-[var(--fold-border)] bg-white/80 p-4">
            <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-base font-semibold text-foreground">{card.title}</p>
            <p className="text-sm text-muted-foreground">{card.description}</p>
            <Button asChild variant="ghost" className="mt-3 justify-start px-0 text-primary">
              <Link href={card.href}>{ctaLabel}</Link>
            </Button>
          </div>
        );
      })}
    </aside>
  );
}
