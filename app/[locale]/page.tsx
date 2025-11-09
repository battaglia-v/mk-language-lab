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
    <div className="min-h-screen bg-background">
      {/* Welcome Banner for first-time visitors */}
      <WelcomeBanner />

      {/* Hero Section - Compact */}
      <section className="w-full border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-8">
          <div className="text-center space-y-3 md:space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              {t('learn')}{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Македонски
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm md:text-base lg:text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Word of the Day */}
      <section id="word-of-day" className="w-full border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-4 md:py-6">
          <WordOfTheDay />
        </div>
      </section>

      {/* Quick Start - Compact */}
      <section className="w-full">
        <div className="mx-auto max-w-4xl px-4 py-4 md:py-6">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">Quick Start</h2>

          <div className="grid gap-3 md:gap-4 md:grid-cols-2">
            {/* Practice Card */}
            <Card className="group relative overflow-hidden border border-border/40 bg-background p-4 md:p-5 transition-all hover:border-primary/50 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                  <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Daily Practice</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Master vocabulary through interactive quizzes
                  </p>
                </div>
              </div>
              <Button size="sm" className="w-full mt-2" asChild>
                <Link href={buildHref('/practice')}>
                  Start Practicing
                </Link>
              </Button>
            </Card>

            {/* Resources Card */}
            <Card className="group relative overflow-hidden border border-border/40 bg-background p-4 md:p-5 transition-all hover:border-secondary/50 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-secondary/10 flex-shrink-0">
                  <Library className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Learning Resources</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Explore curated materials from native speakers
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                <Link href={buildHref('/resources')}>
                  Explore Resources
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
