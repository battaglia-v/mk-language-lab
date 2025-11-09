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
    <div className="bg-background">
      {/* Welcome Banner for first-time visitors */}
      <WelcomeBanner />

      {/* Hero Section - Ultra Compact */}
      <section className="w-full border-b border-border/40 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-4xl px-4 py-3 md:py-4">
          <h1 className="text-center text-lg font-bold tracking-tight text-foreground md:text-2xl">
            {t('learn')}{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Македонски
            </span>
          </h1>
          <p className="hidden md:block text-center text-sm text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Word of the Day - Horizontal Compact */}
      <section id="word-of-day" className="w-full border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <WordOfTheDay />
        </div>
      </section>

      {/* Quick Start - Side by Side, Ultra Compact */}
      <section className="w-full">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {/* Practice Card */}
            <Link
              href={buildHref('/practice')}
              className="block border border-border/40 rounded-lg p-3 md:p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{t('dailyPractice')}</h3>
                  <p className="hidden md:block text-xs text-muted-foreground mt-0.5">
                    {t('dailyPracticeDesc')}
                  </p>
                </div>
              </div>
            </Link>

            {/* Resources Card */}
            <Link
              href={buildHref('/resources')}
              className="block border border-border/40 rounded-lg p-3 md:p-4 transition-colors hover:border-secondary/50 hover:bg-secondary/5"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <Library className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{t('resourcesTitle')}</h3>
                  <p className="hidden md:block text-xs text-muted-foreground mt-0.5">
                    {t('resourcesDesc')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
