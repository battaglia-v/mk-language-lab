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

      {/* Quick Start - Side by Side, Duolingo-Style Chunky Buttons */}
      <section className="w-full">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Practice Button - Duolingo Green */}
            <Link
              href={buildHref('/practice')}
              className="block bg-[#58CC02] hover:bg-[#4CAF02] text-white border-b-4 border-[#4CAF02] active:border-b-0 rounded-2xl p-4 md:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:mt-1"
            >
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <RefreshCw className="h-8 w-8 md:h-10 md:w-10" />
                <div>
                  <h3 className="text-sm md:text-base font-bold uppercase tracking-wide">{t('dailyPractice')}</h3>
                  <p className="hidden md:block text-xs font-medium mt-1 opacity-90">
                    {t('dailyPracticeDesc')}
                  </p>
                </div>
              </div>
            </Link>

            {/* Resources Button - Orange */}
            <Link
              href={buildHref('/resources')}
              className="block bg-[#FF9600] hover:bg-[#E58600] text-white border-b-4 border-[#E58600] active:border-b-0 rounded-2xl p-4 md:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:mt-1"
            >
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <Library className="h-8 w-8 md:h-10 md:w-10" />
                <div>
                  <h3 className="text-sm md:text-base font-bold uppercase tracking-wide">{t('resourcesTitle')}</h3>
                  <p className="hidden md:block text-xs font-medium mt-1 opacity-90">
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
