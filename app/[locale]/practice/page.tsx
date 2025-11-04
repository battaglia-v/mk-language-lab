'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { practiceCards } from '@/data/practice';

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

          {/* Practice Cards Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {practiceCards.map((card) => {
              const Icon = card.icon;

              return (
                <Card
                  key={card.id}
                  className="group relative overflow-hidden border border-border/40 bg-card/70 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl"
                >
                  <CardHeader className="space-y-4 pb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 via-secondary/80 to-primary/40 text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl text-foreground">
                        {t(card.titleKey)}
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground">
                        {t(card.descriptionKey)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button size="lg" className="w-full gap-2" asChild>
                      <Link href={buildHref(card.href)}>
                        Start
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Tip */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Start with vocabulary practice on the homepage for quick daily drills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
