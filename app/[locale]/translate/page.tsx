'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleTranslateWidget from '@/components/GoogleTranslateWidget';

export default function TranslatePage() {
  const t = useTranslations('translate');
  const locale = useLocale();
  const rawTips = t.raw('tips');
  const tips = Array.isArray(rawTips) ? (rawTips as string[]) : [];

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="space-y-4 text-center">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/5 text-primary">
              {t('badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">{t('subtitle')}</p>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl text-foreground">{t('widgetTitle')}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t('widgetDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleTranslateWidget loadingLabel={t('widgetLoading')} errorLabel={t('widgetError')} />
              <p className="text-xs text-muted-foreground">{t('widgetDisclaimer')}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">{t('tipsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">{tips.map((tip) => (
                <li key={tip} className="rounded-md border border-border/40 bg-background/40 p-3">
                  {tip}
                </li>
              ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur">
            <CardHeader className="space-y-2 text-center md:text-left">
              <CardTitle className="text-xl text-foreground">{t('resourcesTitle')}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('resourcesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center md:justify-start">
              <Button asChild size="lg">
                <Link href={buildHref('/resources')}>{t('resourcesCta')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>
            Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
