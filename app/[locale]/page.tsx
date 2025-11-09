'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WordOfTheDay } from '@/components/learn/WordOfTheDay';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import {
  RefreshCw,
  Library,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Welcome Banner for first-time visitors */}
      <WelcomeBanner />

      {/* Hero Section - Simplified */}
      <section className="w-full bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-6 py-16 lg:py-24">
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Hero Content */}
            <div className="space-y-8 text-center">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  {t('learn')}{' '}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Македонски
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Word of the Day */}
      <section id="word-of-day" className="w-full py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-3xl">
            <WordOfTheDay />
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

            {/* Continue Learning Widget - Temporarily disabled, will add back with proper auth flow */}
            {/* <Suspense fallback={<div className="h-48 animate-pulse bg-muted/50 rounded-lg" />}>
              <ContinueLearningServer />
            </Suspense> */}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Practice Card */}
              <Card className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl flex flex-col">
                {/* Decorative gradient */}
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-70" />

                <div className="relative flex flex-col flex-1">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform group-hover:scale-110 mb-6">
                    <RefreshCw className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-2xl font-semibold text-foreground">Daily Practice</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      Master vocabulary through interactive quizzes. Practice bidirectional translation and track your progress.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground pb-4">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-primary">•</span>
                        <span>Bidirectional translation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-primary">•</span>
                        <span>Instant feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-primary">•</span>
                        <span>Self-paced learning</span>
                      </li>
                    </ul>
                  </div>
                  <Button size="lg" className="w-full group-hover:shadow-lg transition-shadow mt-auto" asChild>
                    <Link href={buildHref('/practice')}>
                      Start Practicing
                    </Link>
                  </Button>
                </div>
              </Card>

              {/* Resources Card */}
              <Card className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background p-8 transition-all duration-300 hover:scale-[1.02] hover:border-secondary/50 hover:shadow-xl flex flex-col">
                {/* Decorative gradient */}
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-secondary/5 blur-3xl transition-opacity group-hover:opacity-70" />

                <div className="relative flex flex-col flex-1">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 transition-transform group-hover:scale-110 mb-6">
                    <Library className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-2xl font-semibold text-foreground">Learning Resources</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      Explore curated materials from native speakers: dictionaries, grammar guides, videos, and cultural insights.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground pb-4">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-secondary">•</span>
                        <span>Verified references</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-secondary">•</span>
                        <span>Authentic content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 text-secondary">•</span>
                        <span>Cultural context</span>
                      </li>
                    </ul>
                  </div>
                  <Button size="lg" variant="outline" className="w-full group-hover:shadow-lg transition-shadow mt-auto" asChild>
                    <Link href={buildHref('/resources')}>
                      Explore Resources
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
