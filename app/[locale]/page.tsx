'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HeroProgressSummary, type JourneyGoalMeta } from '@/components/journey/HeroProgressSummary';
import { QuickPracticeWidget } from '@/components/learn/QuickPracticeWidget';
import { DailyLessons } from '@/components/learn/DailyLessons';
import {
  Compass,
  RefreshCw,
  Library,
} from 'lucide-react';

type StatItem = {
  key: 'activeGoal' | 'steps' | 'lastSession';
  label: string;
  fallback?: string;
};

const goalMeta: JourneyGoalMeta = {
  family: { accent: 'from-primary/80 via-secondary/50 to-primary/20', minutes: 20 },
  travel: { accent: 'from-secondary/70 via-primary/40 to-secondary/20', minutes: 25 },
  culture: { accent: 'from-primary/60 via-secondary/60 to-primary/25', minutes: 30 },
};

export default function JourneyHomePage() {
  const t = useTranslations('journey');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const stats: StatItem[] = [
    {
      key: 'activeGoal',
      label: t('progress.stats.activeGoal.label'),
    },
    {
      key: 'steps',
      label: t('progress.stats.steps.label'),
    },
    {
      key: 'lastSession',
      label: t('progress.stats.lastSession.label'),
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section - Simplified and Focused */}
      <section className="w-full bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-6 py-12 lg:py-20">
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Progress at Top */}
            <div className="flex justify-center">
              <HeroProgressSummary
                stats={stats}
                practiceHref={buildHref('/practice')}
                journeyMeta={goalMeta}
              />
            </div>

            {/* Hero Content */}
            <div className="space-y-8 text-center">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  {t('title')}
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Inline Quick Practice - Main Action */}
            <div className="mx-auto max-w-2xl">
              <QuickPracticeWidget layout="default" />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start - Simplified */}
      <section className="w-full py-16">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Quick Start</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Practice Card */}
              <Card className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <RefreshCw className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">Vocabulary Practice</h3>
                    <p className="text-base text-muted-foreground">Practice with interactive quizzes</p>
                  </div>
                  <Button size="lg" className="w-full" asChild>
                    <Link href={buildHref('/practice')}>
                      Start Practicing →
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Resources Card */}
              <Card className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                      <Library className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-foreground">Learning Resources</h3>
                    <p className="text-base text-muted-foreground">Explore curated materials</p>
                  </div>
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link href={buildHref('/resources')}>
                      Browse Resources →
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Lessons from Instagram */}
      <section className="w-full py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <DailyLessons limit={9} showViewAll />
          </div>
        </div>
      </section>

      {/* Journey Progress - Compact */}
      <section className="w-full py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-4xl">
            <Card className="border border-border/40 bg-card/50 p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">{t('goals.cards.family.title')}</h3>
                </div>
                <Button size="lg" variant="secondary" asChild>
                  <Link href={buildHref('/journey/family')}>
                    <Compass className="mr-2 h-5 w-5" />
                    View Details
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
