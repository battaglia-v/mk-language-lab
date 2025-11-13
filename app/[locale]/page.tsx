'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { WebTypography, WebButton, WebCard, WebStatPill, WebProgressRing } from '@mk/ui';
import { WordOfTheDay } from '@/components/learn/WordOfTheDay';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BookOpen,
  BookMarked,
  Headphones,
  Compass,
  Flame,
  Library,
  RefreshCw,
  Sparkles,
  Target,
  MessageCircle
} from 'lucide-react';

type FocusChallengeDefinition = {
  key: 'vocabulary' | 'listening' | 'translator';
  icon: LucideIcon;
  status: 'inProgress' | 'completed';
  progressValues: Record<string, number>;
};

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);
  const practiceStats = {
    xpEarned: 320,
    dailyGoal: 450,
    streakDays: 7,
    weeklyLessons: 5,
    translatorDirection: locale === 'mk' ? 'МК → ЕН' : 'Mk → En'
  };
  const xpPercent = Math.min(100, Math.round((practiceStats.xpEarned / practiceStats.dailyGoal) * 100));
  const focusChallenges: FocusChallengeDefinition[] = [
    {
      key: 'vocabulary',
      icon: BookMarked,
      status: 'inProgress' as const,
      progressValues: { current: 12, total: 15 }
    },
    {
      key: 'listening',
      icon: Headphones,
      status: 'completed' as const,
      progressValues: { minutes: 10 }
    },
    {
      key: 'translator',
      icon: MessageCircle,
      status: 'inProgress' as const,
      progressValues: { current: 2, total: 3 }
    }
  ];
  const relativeTimeFormatter = new Intl.RelativeTimeFormat(locale === 'mk' ? 'mk' : 'en', {
    numeric: 'auto'
  });
  const translatorEntries = [
    {
      id: 'greeting',
      phrase: '„Здраво, ќе се видиме подоцна.“',
      direction: locale === 'mk' ? 'МК → ЕН' : 'Mk → En',
      timeValue: -2,
      timeUnit: 'hour' as const
    },
    {
      id: 'coffee',
      phrase: '„Може ли две кафиња без шеќер?“',
      direction: locale === 'mk' ? 'МК → ЕН' : 'Mk → En',
      timeValue: -30,
      timeUnit: 'minute' as const
    },
    {
      id: 'idiom',
      phrase: '„It is raining cats and dogs.“',
      direction: locale === 'mk' ? 'ЕН → МК' : 'En → Mk',
      timeValue: -1,
      timeUnit: 'day' as const
    }
  ];

  const focusProgressLabel = (key: 'vocabulary' | 'listening' | 'translator', values: Record<string, number>) => {
    if (key === 'vocabulary') {
      return t('dailyFocus.items.vocabulary.progress', values);
    }
    if (key === 'listening') {
      return t('dailyFocus.items.listening.progress', values);
    }
    return t('dailyFocus.items.translator.progress', values);
  };

  return (
    <div className="bg-background">
      {/* Welcome Banner for first-time visitors */}
      <WelcomeBanner />

      {/* Hero Section - Progress-focused */}
      <section className="w-full border-b border-border/30 bg-gradient-to-b from-[var(--brand-red)]/10 via-transparent to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
          <div className="mb-4 flex items-center gap-2 text-[var(--brand-red)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <WebTypography as="span" variant="eyebrow" style={{ color: 'var(--brand-red)' }}>
              {t('learn')} Македонски
            </WebTypography>
          </div>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <WebCard style={{ padding: 24, background: 'var(--surface-elevated)' }}>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-red)]">
                <Flame className="h-4 w-4" aria-hidden="true" />
                <span>{t('heroSection.streak', { count: practiceStats.streakDays })}</span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
                {t('heroSection.title')}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                {t('heroSection.subtitle')}
              </p>

              <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
                <WebProgressRing
                  progress={xpPercent / 100}
                  value={t('heroSection.xpProgress', {
                    earned: practiceStats.xpEarned,
                    goal: practiceStats.dailyGoal,
                  })}
                  label={t('heroSection.dailyGoal', { value: practiceStats.dailyGoal })}
                />
                <div className="flex flex-wrap gap-3">
                  <WebStatPill
                    label={t('heroSection.streak', { count: practiceStats.streakDays })}
                    value={t('heroSection.weeklyLessons', { count: practiceStats.weeklyLessons })}
                  />
                  <WebStatPill
                    label={t('heroSection.translatorDirection', {
                      direction: practiceStats.translatorDirection,
                    })}
                    value={t('translatorInbox.title')}
                    accent="green"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <WebButton asChild>
                  <Link href={buildHref('/practice')}>
                    {t('heroSection.continueCta')}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </WebButton>
                <WebButton asChild variant="ghost">
                  <Link href={buildHref('/learn')}>{t('heroSection.viewPlan')}</Link>
                </WebButton>
              </div>
            </WebCard>

            <WebCard style={{ padding: 20 }} emphasis="accent">
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-dashed border-[var(--brand-red)]/40 bg-[var(--brand-gold)]/20 p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-[var(--brand-red)]" aria-hidden="true" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t('heroSection.dailyGoal', { value: practiceStats.dailyGoal })}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {t('heroSection.weeklyLessons', { count: practiceStats.weeklyLessons })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/80 bg-surface-frosted p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-[var(--brand-red)]" aria-hidden="true" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t('translateFeatureTitle')}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {t('heroSection.translatorDirection', { direction: practiceStats.translatorDirection })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </WebCard>
          </div>
        </div>
      </section>

      {/* Word of the Day - Horizontal Compact */}
      <section id="word-of-day" className="w-full border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <WordOfTheDay />
        </div>
      </section>

      {/* Action Cards */}
      <section className="w-full">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href={buildHref('/practice')} className="group block focus-visible:outline-none">
              <WebCard style={{ padding: 20, borderColor: 'var(--border-accent-red)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                    <RefreshCw className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{t('actionCards.continue.title')}</p>
                    <p className="text-xs text-muted-foreground">{t('actionCards.continue.description')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <WebStatPill label={t('heroSection.streak', { count: practiceStats.streakDays })} value="MK ↔ EN" />
                  <WebButton asChild variant="ghost">
                    <span className="inline-flex items-center text-[var(--brand-red)]">
                      {t('actionCards.continue.cta')}
                      <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                    </span>
                  </WebButton>
                </div>
              </WebCard>
            </Link>

            <Link href={buildHref('/translate')} className="group block focus-visible:outline-none">
              <WebCard style={{ padding: 20, borderColor: 'var(--border-accent-gold)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-gold)]/20 text-[var(--brand-gold-dark)]">
                    <Compass className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{t('actionCards.translator.title')}</p>
                    <p className="text-xs text-muted-foreground">{t('actionCards.translator.description')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <WebStatPill
                    label={t('translatorInbox.title')}
                    value={practiceStats.translatorDirection}
                    accent="gold"
                  />
                  <WebButton asChild variant="ghost">
                    <span className="inline-flex items-center text-[var(--brand-gold-dark)]">
                      {t('actionCards.translator.cta')}
                      <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                    </span>
                  </WebButton>
                </div>
              </WebCard>
            </Link>

            <Link href={buildHref('/resources')} className="group block focus-visible:outline-none">
              <WebCard style={{ padding: 20, borderColor: 'var(--border-accent-plum)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-plum)]/20 text-[var(--brand-plum)]">
                    <Library className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{t('actionCards.resources.title')}</p>
                    <p className="text-xs text-muted-foreground">{t('actionCards.resources.description')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <WebStatPill label={t('actionCards.resources.cta')} value="Decks • Guides" accent="red" />
                  <WebButton asChild variant="ghost">
                    <span className="inline-flex items-center text-[var(--brand-plum)]">
                      {t('actionCards.resources.cta')}
                      <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                    </span>
                  </WebButton>
                </div>
              </WebCard>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Focus & Translator Inbox */}
      <section className="w-full border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
            <WebCard style={{ padding: 20 }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-red)]">
                    {t('dailyFocus.title')}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('dailyFocus.subtitle')}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {focusChallenges.map(challenge => {
                  const Icon = challenge.icon;
                  const statusLabel = t(`dailyFocus.status.${challenge.status}`);
                  const accent = challenge.status === 'completed' ? 'green' : 'gold';
                  return (
                    <WebCard
                      key={challenge.key}
                      style={{
                        padding: 16,
                        borderColor: 'var(--border-accent-red)',
                        background: 'var(--surface-elevated)',
                      }}
                    >
                      <div className="flex w-full items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {t(`dailyFocus.items.${challenge.key}.title`)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t(`dailyFocus.items.${challenge.key}.description`)}
                          </p>
                        </div>
                        <WebStatPill
                          label={statusLabel}
                          value={focusProgressLabel(challenge.key, challenge.progressValues)}
                          accent={accent}
                        />
                      </div>
                    </WebCard>
                  );
                })}
              </div>
            </WebCard>

            <WebCard style={{ padding: 20 }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-gold-dark)]">
                    {t('translatorInbox.title')}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('translatorInbox.subtitle')}</p>
                </div>
                <Link
                  href={buildHref('/translate')}
                  className="text-xs font-semibold text-[var(--brand-red)] hover:underline"
                >
                  {t('translatorInbox.viewHistory')}
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {translatorEntries.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border/80 bg-surface-frosted p-4 text-xs text-muted-foreground">
                    {t('translatorInbox.empty')}
                  </p>
                ) : (
                  translatorEntries.map(entry => (
                    <WebCard
                      key={entry.id}
                      style={{
                        padding: 16,
                        borderColor: 'var(--border-accent-plum)',
                        background: 'var(--surface-elevated)',
                      }}
                    >
                      <p className="text-sm font-medium text-foreground">{entry.phrase}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <WebStatPill label={entry.direction} value={t('translatorInbox.viewHistory')} accent="gold" />
                        <WebTypography as="span" variant="caption" style={{ color: 'var(--brand-red)' }}>
                          {relativeTimeFormatter.format(entry.timeValue, entry.timeUnit)}
                        </WebTypography>
                      </div>
                    </WebCard>
                  ))
                )}
              </div>
            </WebCard>
          </div>
        </div>
      </section>

    </div>
  );
}
