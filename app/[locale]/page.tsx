import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActiveJourneyStat } from '@/components/journey/ActiveJourneyStat';
import { JourneyStepsStat } from '@/components/journey/JourneyStepsStat';
import { JourneyLastSessionStat } from '@/components/journey/JourneyLastSessionStat';
import { JOURNEY_IDS, JourneyId, JOURNEY_DEFINITIONS } from '@/data/journeys';
import {
  Compass,
  Users,
  Plane,
  Globe2,
  RefreshCw,
  MessageCircle,
  Library,
  Sparkles,
  ArrowRight,
  Newspaper,
} from 'lucide-react';

const QUICK_ACTION_KEYS = ['practice', 'tutor', 'library', 'news'] as const;

type QuickActionKey = (typeof QUICK_ACTION_KEYS)[number];

type StatItem = {
  key: 'activeGoal' | 'steps' | 'lastSession';
  label: string;
  render?: () => ReactNode;
  value?: string;
};

const goalIcons: Record<JourneyId, typeof Users> = {
  family: Users,
  travel: Plane,
  culture: Globe2,
};

const quickActionIcons: Record<QuickActionKey, typeof RefreshCw> = {
  practice: RefreshCw,
  tutor: MessageCircle,
  library: Library,
  news: Newspaper,
};

export default function JourneyHomePage() {
  const t = useTranslations('journey');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const stats: StatItem[] = [
    {
      key: 'activeGoal' as const,
      label: t('progress.stats.activeGoal.label'),
      render: () => <ActiveJourneyStat />,
    },
    {
      key: 'steps' as const,
      label: t('progress.stats.steps.label'),
      render: () => <JourneyStepsStat />,
    },
    {
      key: 'lastSession' as const,
      label: t('progress.stats.lastSession.label'),
      render: () => <JourneyLastSessionStat />,
    },
  ];

  const quickActions = QUICK_ACTION_KEYS.map((key) => {
    switch (key) {
      case 'practice':
        return { key, href: '/practice?section=translation' };
      case 'tutor':
        return { key, href: '/tutor' };
      case 'library':
        return { key, href: '/library' };
      case 'news':
        return { key, href: '/news' };
      default:
        return { key, href: '/' };
    }
  });

  const goals = JOURNEY_IDS.map((key): { key: JourneyId; href: string; focus: string[] } => ({
    key,
    href: JOURNEY_DEFINITIONS[key].path,
    focus: Array.isArray(t.raw(`goals.cards.${key}.focus`)) ? (t.raw(`goals.cards.${key}.focus`) as string[]) : [],
  }));

  const spotlightResources = Array.isArray(t.raw('spotlight.highlights'))
    ? (t.raw('spotlight.highlights') as string[])
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
  <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <div className="space-y-6 text-center md:text-left">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/5 text-primary md:mx-0">
              {t('badge')}
            </Badge>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">{t('title')}</h1>
              <p className="text-lg text-muted-foreground md:max-w-2xl md:text-xl">{t('subtitle')}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <Button size="lg" className="gap-2 text-base md:text-lg" asChild>
                <Link href={buildHref('/journey/family')}>
                  <Compass className="h-5 w-5" />
                  {t('ctaPrimary')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base md:text-lg" asChild>
                <Link href={buildHref('/practice')}>{t('ctaSecondary')}</Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-center sm:text-left">
                <Badge variant="secondary" className="mx-auto w-fit sm:mx-0">
                  {t('progress.badge')}
                </Badge>
                <CardTitle className="text-2xl text-foreground">{t('progress.title')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t('progress.description')}
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <Link href={buildHref('/practice')}>
                  <RefreshCw className="h-4 w-4" />
                  {t('progress.cta')}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.key} className="rounded-xl border border-border/50 bg-background/60 p-4 text-center sm:text-left">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    {stat.render ? (
                      stat.render()
                    ) : (
                      <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <Sparkles className="mx-auto h-5 w-5 text-primary md:mx-0" />
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-foreground">{t('quickActions.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('quickActions.description')}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = quickActionIcons[action.key as QuickActionKey];
              return (
                <Card key={action.key} className="border-border/50 bg-card/60 backdrop-blur">
                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 via-secondary/80 to-primary/40 text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg text-foreground">{t(`quickActions.items.${action.key}.label`)}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {t(`quickActions.items.${action.key}.description`)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="gap-2" asChild>
                      <Link href={buildHref(action.href)}>
                        <ArrowRight className="h-4 w-4" />
                        {t('quickActions.open')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl font-semibold text-foreground">{t('goals.title')}</h2>
            <p className="text-sm text-muted-foreground md:max-w-3xl">{t('goals.description')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => {
              const Icon = goalIcons[goal.key];
              return (
                <Card key={goal.key} className="flex flex-col justify-between border-border/50 bg-card/70 backdrop-blur">
                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary/80 via-primary/80 to-secondary/40 text-secondary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-fit border-primary/40 bg-primary/5 text-primary">
                        {t(`goals.cards.${goal.key}.badge`)}
                      </Badge>
                      <CardTitle className="text-xl text-foreground">{t(`goals.cards.${goal.key}.title`)}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {t(`goals.cards.${goal.key}.description`)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {goal.focus.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="gap-2" asChild>
                      <Link href={buildHref(goal.href)}>
                        <Compass className="h-4 w-4" />
                        {t('goals.cta')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row">
          <Card className="flex-1 border-border/40 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit border-secondary/40 bg-secondary/10 text-secondary">
                {t('spotlight.badge')}
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-2xl text-foreground">{t('spotlight.title')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t('spotlight.description')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {spotlightResources.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="ghost" className="gap-2 self-start" asChild>
                <Link href={buildHref('/library')}>
                  <ArrowRight className="h-4 w-4" />
                  {t('spotlight.cta')}
                </Link>
              </Button>
            </CardContent>
          </Card>
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
