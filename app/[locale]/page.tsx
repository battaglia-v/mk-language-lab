'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { WordOfTheDay } from '@/components/learn/WordOfTheDay';
import { WelcomeBanner } from '@/components/WelcomeBanner';
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
  const focusChallenges = [
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
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--brand-red)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>{t('learn')} Македонски</span>
          </div>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-lg shadow-[var(--brand-red)]/5 md:p-6">
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

              <div className="mt-5 space-y-2 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-inner">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>{t('heroSection.xpProgress', { earned: practiceStats.xpEarned, goal: practiceStats.dailyGoal })}</span>
                  <span>{t('heroSection.dailyGoal', { value: practiceStats.dailyGoal })}</span>
                </div>
                <div className="h-2 rounded-full bg-white/80">
                  <div
                    className="h-2 rounded-full bg-[var(--brand-red)] transition-all"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={buildHref('/practice')}
                  className="inline-flex items-center justify-center rounded-2xl border-b-4 border-[var(--brand-red-dark)] bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-red-dark)] hover:shadow-xl active:border-b-0 active:translate-y-0"
                >
                  {t('heroSection.continueCta')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={buildHref('/learn')}
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-red)] transition hover:bg-[var(--brand-red)]/10"
                >
                  {t('heroSection.viewPlan')}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/95 p-4 shadow-lg shadow-[var(--brand-gold)]/20 md:p-5">
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
                <div className="rounded-2xl border border-border/80 bg-white/70 p-4">
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
            </div>
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
            <Link
              href={buildHref('/practice')}
              className="group card-hover block rounded-3xl border border-[var(--brand-red)] bg-card/90 p-4 shadow-lg shadow-[var(--brand-red)]/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <RefreshCw className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t('actionCards.continue.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('actionCards.continue.description')}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center text-xs font-semibold text-[var(--brand-red)] group-hover:gap-2 transition-all">
                {t('actionCards.continue.cta')}
                <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href={buildHref('/translate')}
              className="group card-hover block rounded-3xl border border-[var(--brand-gold-dark)] bg-card/90 p-4 shadow-lg shadow-[var(--brand-gold)]/15"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold-dark)]">
                  <Compass className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t('actionCards.translator.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('actionCards.translator.description')}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center text-xs font-semibold text-[var(--brand-gold-dark)] group-hover:gap-2 transition-all">
                {t('actionCards.translator.cta')}
                <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </div>
            </Link>

            <Link
              href={buildHref('/resources')}
              className="group card-hover block rounded-3xl border border-border bg-card/90 p-4 shadow-lg shadow-[var(--brand-plum)]/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-plum)]/10 text-[var(--brand-plum)]">
                  <Library className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t('actionCards.resources.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('actionCards.resources.description')}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center text-xs font-semibold text-[var(--brand-plum)] group-hover:gap-2 transition-all">
                {t('actionCards.resources.cta')}
                <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Focus & Translator Inbox */}
      <section className="w-full border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-lg shadow-[var(--brand-red)]/5">
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
                  return (
                    <button
                      key={challenge.key}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-white/70 px-3 py-3 text-left shadow-sm transition hover:border-[var(--brand-red)]/40 hover:bg-white"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
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
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            challenge.status === 'completed'
                              ? 'bg-[var(--brand-mint)] text-[var(--brand-green-dark)]'
                              : 'bg-[var(--brand-gold)]/40 text-[var(--brand-red)]'
                          }`}
                        >
                          {statusLabel}
                        </span>
                        <p className="mt-1 text-xs font-semibold text-muted-foreground">
                          {focusProgressLabel(challenge.key, challenge.progressValues)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-lg shadow-[var(--brand-gold)]/15">
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
                  <p className="rounded-2xl border border-dashed border-border/80 bg-white/60 p-4 text-xs text-muted-foreground">
                    {t('translatorInbox.empty')}
                  </p>
                ) : (
                  translatorEntries.map(entry => (
                    <div key={entry.id} className="rounded-2xl border border-border/70 bg-white/70 p-3">
                      <p className="text-sm font-medium text-foreground">{entry.phrase}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{entry.direction}</span>
                        <span>{relativeTimeFormatter.format(entry.timeValue, entry.timeUnit)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
