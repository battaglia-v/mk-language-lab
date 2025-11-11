'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

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
    </div>
  );
}
