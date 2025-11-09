'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Languages } from 'lucide-react';

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

export default function PracticeHubPage() {
  const t = useTranslations('practiceHub');
  const locale = useLocale();

  const buildHref = useCallback(
    (path: string) => (path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`),
    [locale]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Compact Header Bar */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm px-4 py-3 md:py-4">
        <div className="mx-auto max-w-4xl space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              {t('title')}
            </h1>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
              {t('badge')}
            </Badge>
          </div>
          <p className="hidden md:block text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Full-Screen Practice Widget */}
      <div className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col px-4 py-3 md:py-4">
          <QuickPracticeWidget layout="default" />
        </div>
      </div>

      {/* Translator Link - Bottom Fixed or Floating */}
      <div className="border-t border-border/40 bg-card/50 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Languages className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Need to translate something?</h3>
                <p className="hidden sm:block text-xs text-muted-foreground">Use our translation tool</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href={buildHref('/translate')}>
                Open
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
