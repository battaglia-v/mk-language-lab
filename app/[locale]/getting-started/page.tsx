'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight, BookOpen, Target, Flame, Trophy, MessageCircle, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout';

export default function GettingStartedPage() {
  const locale = useLocale();
  const t = useTranslations('gettingStarted');

  const steps = [
    {
      icon: Target,
      title: t('step1Title'),
      description: t('step1Desc'),
      link: `/${locale}/learn`,
      linkText: t('step1Link'),
    },
    {
      icon: BookOpen,
      title: t('step2Title'),
      description: t('step2Desc'),
      link: `/${locale}/practice`,
      linkText: t('step2Link'),
    },
    {
      icon: Languages,
      title: t('step3Title'),
      description: t('step3Desc'),
      link: `/${locale}/translate`,
      linkText: t('step3Link'),
    },
    {
      icon: Flame,
      title: t('step4Title'),
      description: t('step4Desc'),
    },
    {
      icon: Trophy,
      title: t('step5Title'),
      description: t('step5Desc'),
    },
  ];

  return (
    <PageContainer size="md" className="pb-24 sm:pb-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
          >
            <Link href={`/${locale}/help`} data-testid="getting-started-back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        {/* Welcome message */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('welcomeTitle')}</h2>
          <p className="text-muted-foreground">{t('welcomeDesc')}</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="rounded-xl border border-border/40 bg-card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.link && (
                      <Button asChild variant="link" className="h-auto p-0 text-primary">
                        <Link href={step.link}>
                          {step.linkText}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips section */}
        <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t('tipsTitle')}</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('tip1')}</li>
            <li>• {t('tip2')}</li>
            <li>• {t('tip3')}</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/${locale}/learn`} data-testid="getting-started-cta">
              {t('startLearning')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
