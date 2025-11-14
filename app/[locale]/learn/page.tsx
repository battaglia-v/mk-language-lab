'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, BookOpenCheck, MessageCircle, Volume2 } from 'lucide-react';

// Dynamic import for QuickPracticeWidget to reduce initial bundle size
const QuickPracticeWidget = dynamic(
  () => import('@/components/learn/QuickPracticeWidget').then(mod => ({ default: mod.QuickPracticeWidget })),
  {
    loading: () => (
      <div className="h-[600px] animate-pulse rounded-xl bg-muted/50" />
    ),
    ssr: false
  }
);

export default function LearnPage() {
  const t = useTranslations('learn');
  const locale = useLocale();
  const modules = useMemo(
    () => [
      {
        title: t('vocabulary'),
        description: t('vocabularyDesc'),
        icon: BookOpen,
        gradient: 'from-pink-500 to-rose-500',
        href: '/learn/vocabulary',
      },
      {
        title: t('grammar'),
        description: t('grammarDesc'),
        icon: BookOpenCheck,
        gradient: 'from-purple-500 to-indigo-500',
        href: '/learn/grammar',
      },
      {
        title: t('phrases'),
        description: t('phrasesDesc'),
        icon: MessageCircle,
        gradient: 'from-cyan-500 to-blue-500',
        href: '/learn/phrases',
      },
      {
        title: t('pronunciation'),
        description: t('pronunciationDesc'),
        icon: Volume2,
        gradient: 'from-orange-500 to-amber-500',
        href: '/learn/pronunciation',
      },
    ],
    [t]
  );

  return (
    <div className="section-container section-container-xl section-spacing-md">
        {/* Header */}
        <div className="mx-auto mb-5 max-w-3xl text-center md:mb-10">
          <h1 className="mb-2 text-2xl font-bold text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text sm:text-3xl md:mb-3 md:text-4xl lg:text-5xl">
            {t('title')}
          </h1>
          <p className="mb-2 text-sm text-muted-foreground md:mb-3 md:text-lg lg:text-xl">{t('subtitle')}</p>
          <p className="text-xs text-muted-foreground md:text-base">{t('modulesIntro')}</p>
        </div>

        {/* Learning Modules */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mb-10 md:gap-5">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={`/${locale}${module.href}`} className="group block">
                <Card className="h-full border-border/50 bg-card/60 backdrop-blur transition-all duration-300 group-hover:scale-[1.02] group-hover:border-primary/50">
                  <CardHeader className="p-4 md:p-5">
                    <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${module.gradient} md:mb-4 md:h-14 md:w-14`}>
                      <Icon className="h-5 w-5 text-white md:h-7 md:w-7" />
                    </div>
                    <CardTitle className="text-lg md:text-2xl">{module.title}</CardTitle>
                    <CardDescription className="pt-1 text-sm md:pt-2 md:text-base">{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mx-auto max-w-3xl">
          <QuickPracticeWidget />
        </div>
    </div>
  );
}
