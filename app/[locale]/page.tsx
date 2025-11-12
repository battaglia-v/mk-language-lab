'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
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
        <div className="mx-auto max-w-4xl px-4 py-2.5 md:py-4">
          <h1 className="text-center text-base font-bold tracking-tight text-foreground sm:text-lg md:text-2xl">
            {t('learn')}{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Македонски
            </span>
          </h1>
          <p className="mt-1 text-center text-xs text-muted-foreground md:text-sm">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {/* Practice Button - Primary CTA */}
            <Link
              href={buildHref('/practice')}
              className="block rounded-2xl border-b-4 border-[var(--brand-green-dark)] bg-[var(--brand-green)] p-3 text-center text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-green-dark)] hover:shadow-xl active:mt-1 active:translate-y-0 active:border-b-0 md:p-5"
            >
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <RefreshCw className="h-6 w-6 md:h-9 md:w-9" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide md:text-base">{t('dailyPractice')}</h3>
                  <p className="mt-1 text-xs font-medium opacity-90">
                    {t('dailyPracticeDesc')}
                  </p>
                </div>
              </div>
            </Link>

            {/* Resources Button - Secondary CTA */}
            <Link
              href={buildHref('/resources')}
              className="block rounded-2xl border-b-4 border-[var(--brand-gold-dark)] bg-[var(--brand-gold)] p-3 text-center text-[#1f1403] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-gold-dark)] hover:shadow-xl active:mt-1 active:translate-y-0 active:border-b-0 md:p-5"
            >
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <Library className="h-6 w-6 md:h-9 md:w-9" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide md:text-base">{t('resourcesTitle')}</h3>
                  <p className="mt-1 text-xs font-medium opacity-90">
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
