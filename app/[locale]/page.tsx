'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { WebTypography, WebButton, WebCard } from '@mk/ui';
import { ArrowRight, Sparkles, BookOpen, MessageCircle, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

const roles = ['speak', 'read', 'write', 'understand'];

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  return (
    <div className="bg-background">
      {/* Hero Section - Two Column */}
      <section className="w-full border-b border-border/20">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            {/* Left Column - Headline, Role Rotator, CTAs */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--brand-red)]" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-red)]">
                  Learn Macedonian
                </span>
              </div>

              <h1 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                Learn to{' '}
                <span className="relative inline-block text-[var(--brand-red)]">
                  <span className="transition-opacity duration-500">
                    {roles[currentRole]}
                  </span>
                </span>
                <br />
                Macedonian
              </h1>

              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                Master the language through interactive lessons, real conversations, and cultural immersion.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <WebButton asChild size="lg">
                  <Link href={buildHref('/practice')}>
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </WebButton>
                <WebButton asChild variant="outline" size="lg">
                  <Link href={buildHref('/learn')}>
                    Explore Curriculum
                  </Link>
                </WebButton>
              </div>
            </div>

            {/* Right Column - Portrait Card */}
            <div className="relative">
              <WebCard style={{ padding: 32, background: 'var(--surface-elevated)' }}>
                <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-[var(--brand-red)]/10 via-[var(--brand-gold)]/10 to-[var(--brand-plum)]/10 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="text-6xl font-bold text-[var(--brand-red)]">Македонски</div>
                    <div className="text-2xl text-muted-foreground">Language Lab</div>
                    <div className="flex items-center justify-center gap-6 pt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">450+</div>
                        <div className="text-sm text-muted-foreground">Words</div>
                      </div>
                      <div className="h-12 w-px bg-border"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">50+</div>
                        <div className="text-sm text-muted-foreground">Lessons</div>
                      </div>
                    </div>
                  </div>
                </div>
              </WebCard>
            </div>
          </div>
        </div>
      </section>

      {/* Three Value Cards */}
      <section className="w-full border-b border-border/20 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Interactive Practice */}
            <WebCard style={{ padding: 28 }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-red)]/10">
                <Target className="h-6 w-6 text-[var(--brand-red)]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                Interactive Practice
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Master vocabulary, grammar, and pronunciation through engaging exercises designed by language experts.
              </p>
              <Link
                href={buildHref('/practice')}
                className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--brand-red)] hover:underline"
              >
                Start practicing
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </WebCard>

            {/* Card 2: Live Translation */}
            <WebCard style={{ padding: 28 }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-gold)]/20">
                <MessageCircle className="h-6 w-6 text-[var(--brand-gold-dark)]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                Live Translation
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Translate phrases instantly and save your history. Perfect for real conversations and travel scenarios.
              </p>
              <Link
                href={buildHref('/translate')}
                className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--brand-gold-dark)] hover:underline"
              >
                Try translator
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </WebCard>

            {/* Card 3: Cultural Context */}
            <WebCard style={{ padding: 28 }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-plum)]/20">
                <BookOpen className="h-6 w-6 text-[var(--brand-plum)]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                Cultural Context
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Discover Macedonian culture, traditions, and customs while learning the language authentically.
              </p>
              <Link
                href={buildHref('/resources')}
                className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--brand-plum)] hover:underline"
              >
                Explore resources
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </WebCard>
          </div>
        </div>
      </section>
    </div>
  );
}
