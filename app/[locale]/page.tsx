import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Languages, Newspaper } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);
  const heroHighlights = [
    { label: t('heroHighlightTranslate'), icon: Languages },
    { label: t('heroHighlightResources'), icon: BookOpen },
    { label: t('heroHighlightNews'), icon: Newspaper },
  ];

  const featureCards = [
    {
      title: t('translateFeatureTitle'),
      description: t('translateFeatureDescription'),
      cta: t('ctaTranslate'),
      path: '/translate',
      icon: Languages,
      accent: 'from-orange-500/80 via-red-500/70 to-orange-400/50',
    },
    {
      title: t('resourcesFeatureTitle'),
      description: t('resourcesFeatureDescription'),
      cta: t('ctaResources'),
      path: '/resources',
      icon: BookOpen,
      accent: 'from-indigo-500/80 via-violet-500/70 to-indigo-400/50',
    },
    {
      title: t('newsFeatureTitle'),
      description: t('newsFeatureDescription'),
      cta: t('ctaNews'),
      path: '/news',
      icon: Newspaper,
      accent: 'from-sky-500/80 via-blue-500/70 to-sky-400/50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          <div className="space-y-8 text-center md:text-left">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/5 text-primary md:mx-0">
              {t('badge')}
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                {t('title')}
              </h1>
              <p className="text-lg text-muted-foreground md:max-w-2xl md:text-xl">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <Button size="lg" className="text-base md:text-lg" asChild>
                <Link href={buildHref('/translate')}>{t('ctaTranslate')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base md:text-lg" asChild>
                <Link href={buildHref('/resources')}>{t('ctaResources')}</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="border-border/50 bg-card/60 backdrop-blur">
                    <CardContent className="flex items-center gap-3 py-5">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="space-y-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-background shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="gap-2" asChild>
                    <Link href={buildHref(feature.path)}>
                      <ArrowRight className="h-4 w-4" />
                      {feature.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

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
