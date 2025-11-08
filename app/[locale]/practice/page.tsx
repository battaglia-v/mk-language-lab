'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Languages } from 'lucide-react';
import { QuickPracticeWidget } from '@/components/learn/QuickPracticeWidget';

export default function PracticeHubPage() {
  const t = useTranslations('practiceHub');
  const locale = useLocale();

  const buildHref = useCallback(
    (path: string) => (path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`),
    [locale]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/10 text-primary">
              {t('badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              {t('subtitle')}
            </p>
          </div>

          {/* Quick Practice Widget - Hero */}
          <div className="mx-auto w-full max-w-4xl">
            <QuickPracticeWidget layout="default" />
          </div>

          {/* Translator Link Card */}
          <div className="mx-auto max-w-2xl">
            <Card className="border border-border/40 bg-card/50 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                    <Languages className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Need to translate something?</h3>
                    <p className="text-sm text-muted-foreground">Use our translation tool with helpful tips</p>
                  </div>
                </div>
                <Button variant="outline" className="gap-2" asChild>
                  <Link href={buildHref('/translate')}>
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
