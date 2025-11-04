import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroProgressSummary, type JourneyGoalMeta } from '@/components/journey/HeroProgressSummary';
import { JOURNEY_IDS, JourneyId, JOURNEY_DEFINITIONS } from '@/data/journeys';
import { QuickPracticeWidget } from '@/components/learn/QuickPracticeWidget';
import {
  Compass,
  Users,
  Plane,
  Globe2,
  RefreshCw,
  Library,
  Sparkles,
  ArrowRight,
  Newspaper,
  TrendingUp,
  Headphones,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    key: 'practice',
    href: '/practice?section=translation',
    icon: RefreshCw,
    accent: 'from-primary/70 via-secondary/40 to-primary/20',
    progress: 62,
    minutes: 15,
  },
  {
    key: 'library',
    href: '/library',
    icon: Library,
    accent: 'from-primary/60 via-secondary/30 to-primary/10',
    progress: 35,
    minutes: 12,
  },
  {
    key: 'news',
    href: '/news',
    icon: Newspaper,
    accent: 'from-secondary/60 via-primary/30 to-secondary/10',
    progress: 54,
    minutes: 8,
  },
] as const;

type StatItem = {
  key: 'activeGoal' | 'steps' | 'lastSession';
  label: string;
  fallback?: string;
};


const RECOMMENDED = [
  {
    key: 'listeningLab',
    href: '/practice?section=pronunciation',
    icon: Headphones,
    accent: 'from-secondary/60 via-primary/40 to-secondary/15',
  },
  {
    key: 'cultureDeepDive',
    href: '/journey/culture',
    icon: Sparkles,
    accent: 'from-primary/60 via-secondary/50 to-primary/20',
  },
  {
    key: 'travelToolkit',
    href: '/journey/travel',
    icon: Plane,
    accent: 'from-secondary/70 via-primary/45 to-secondary/15',
  },
] as const;

const goalIcons: Record<JourneyId, typeof Users> = {
  family: Users,
  travel: Plane,
  culture: Globe2,
};

const goalMeta: JourneyGoalMeta = {
  family: { accent: 'from-primary/80 via-secondary/50 to-primary/20', minutes: 20 },
  travel: { accent: 'from-secondary/70 via-primary/40 to-secondary/20', minutes: 25 },
  culture: { accent: 'from-primary/60 via-secondary/60 to-primary/25', minutes: 30 },
};

export default function JourneyHomePage() {
  const t = useTranslations('journey');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const stats: StatItem[] = [
    {
      key: 'activeGoal',
      label: t('progress.stats.activeGoal.label'),
    },
    {
      key: 'steps',
      label: t('progress.stats.steps.label'),
    },
    {
      key: 'lastSession',
      label: t('progress.stats.lastSession.label'),
    },
  ];

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
      <section className="w-full border-b border-border/30 bg-card/5">
        <div className="container mx-auto px-6 py-20 sm:py-24">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 lg:flex-row lg:items-start">
            <div className="flex flex-1 flex-col gap-12">
              <div className="space-y-8 text-center md:text-left">
                <Badge
                  variant="outline"
                  className="mx-auto w-fit rounded-full border-primary/40 bg-primary/5 px-4 py-1.5 text-sm text-primary md:mx-0"
                >
                  {t('badge')}
                </Badge>
                <div className="space-y-6">
                  <h1 className="leading-tight text-5xl font-bold tracking-tight text-foreground md:text-7xl">
                    {t('title')}
                  </h1>
                  <p className="leading-relaxed text-xl text-muted-foreground md:max-w-2xl md:text-2xl">
                    {t('subtitle')}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 md:justify-start">
                  <Button size="lg" className="h-14 gap-3 px-10 text-lg" asChild>
                    <Link href={buildHref('/journey/family')}>
                      <Compass className="h-6 w-6" />
                      {t('ctaPrimary')}
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg" asChild>
                    <Link href={buildHref('/practice')}>{t('ctaSecondary')}</Link>
                  </Button>
                  <Button size="lg" variant="ghost" className="h-14 gap-3 px-10 text-lg" asChild>
                    <Link href={buildHref('/news')}>
                      <Newspaper className="h-6 w-6" />
                      {t('ctaNews')}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] border border-border/40 bg-gradient-to-br from-primary/10 via-secondary/10 to-muted/20 p-8 shadow-xl">
                <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
                <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-6 lg:max-w-xl">
                    <Badge variant="secondary" className="w-fit rounded-full border-transparent bg-primary/10 text-primary">
                      {t('progress.badge')}
                    </Badge>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-semibold text-foreground">{t('progress.title')}</h2>
                      <p className="text-base text-muted-foreground">{t('progress.description')}</p>
                    </div>
                  </div>
                  <HeroProgressSummary
                    stats={stats}
                    practiceHref={buildHref('/practice')}
                    journeyMeta={goalMeta}
                  />
                </div>
              </div>
            </div>

            <div className="w-full lg:max-w-md lg:pl-8">
              <div className="mx-auto w-full max-w-md lg:mx-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
                <QuickPracticeWidget layout="compact" className="h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="container mx-auto px-6 pb-20">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary md:hidden">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex w-full items-center gap-4 md:w-auto">
                <Sparkles className="hidden h-6 w-6 text-primary md:block" />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t('quickActions.title')}</h2>
                  <p className="text-base text-muted-foreground">{t('quickActions.description')}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.key}
                    className="group relative overflow-hidden rounded-[28px] border border-border/40 bg-background/70 p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl will-change-transform"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${action.accent} opacity-0 transition group-hover:opacity-40`}
                    />
                    <div className="relative flex h-full flex-col gap-6">
                      <div className="inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6 md:h-7 md:w-7" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-foreground break-words">
                          {t(`quickActions.items.${action.key}.label`)}
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground break-words">
                          {t(`quickActions.items.${action.key}.description`)}
                        </CardDescription>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                          <span>{t('quickActions.progressLabel')}</span>
                          <span>{action.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-foreground/10">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${action.progress}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('quickActions.minutes', { minutes: action.minutes })}
                        </p>
                      </div>
                      <Button variant="ghost" className="mt-auto w-full gap-2" asChild>
                        <Link href={buildHref(action.href)}>
                          <ArrowRight className="h-5 w-5" />
                          {t('quickActions.resume')}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      <section className="w-full">
        <div className="container mx-auto px-6 pb-20">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-secondary/10 text-secondary md:hidden">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="flex w-full items-center gap-4 md:w-auto">
                <TrendingUp className="hidden h-6 w-6 text-secondary md:block" />
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t('recommended.title')}</h2>
                  <p className="text-base text-muted-foreground">{t('recommended.description')}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {RECOMMENDED.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.key}
                    className="group relative overflow-hidden rounded-[32px] border border-border/30 bg-background/70 p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-secondary/50 hover:shadow-2xl will-change-transform"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-25 transition group-hover:opacity-45`}
                    />
                    <div className="relative flex h-full flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="rounded-full border-secondary/40 bg-secondary/10 text-xs text-secondary">
                          {t(`recommended.items.${item.key}.tag`)}
                        </Badge>
                        <Icon className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold text-foreground break-words">
                          {t(`recommended.items.${item.key}.title`)}
                        </h3>
                        <p className="text-base text-muted-foreground break-words">
                          {t(`recommended.items.${item.key}.description`)}
                        </p>
                      </div>
                      <Button variant="ghost" className="mt-auto w-full gap-2" asChild>
                        <Link href={buildHref(item.href)}>
                          <ArrowRight className="h-5 w-5" />
                          {t('recommended.start')}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="container mx-auto px-6 pb-20">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-4xl font-bold text-foreground md:text-5xl">{t('goals.title')}</h2>
              <p className="text-base text-muted-foreground md:max-w-3xl md:text-lg">{t('goals.description')}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => {
                const Icon = goalIcons[goal.key];
                const meta = goalMeta[goal.key];
                return (
                  <Card
                    key={goal.key}
                    className="group relative overflow-hidden rounded-[32px] border border-border/30 bg-background/70 p-8 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-secondary/50 hover:shadow-2xl will-change-transform"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-25 transition group-hover:opacity-45`}
                    />
                    <div className="relative flex h-full flex-col gap-6">
                      <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-7 w-7 md:h-8 md:w-8" />
                      </div>
                      <div className="space-y-3">
                        <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-primary">
                          {t(`goals.cards.${goal.key}.badge`)}
                        </Badge>
                        <h3 className="text-2xl font-semibold text-foreground break-words">
                          {t(`goals.cards.${goal.key}.title`)}
                        </h3>
                        <p className="text-base text-muted-foreground leading-relaxed break-words">
                          {t(`goals.cards.${goal.key}.description`)}
                        </p>
                        <p className="text-sm text-muted-foreground break-words">
                          {t('goals.minutes', { minutes: meta.minutes })}
                        </p>
                      </div>
                      <ul className="space-y-3 text-base text-muted-foreground">
                        {goal.focus.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                            <span className="break-words">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant="secondary" className="mt-auto w-full gap-2" asChild>
                        <Link href={buildHref(goal.href)}>
                          <Compass className="h-5 w-5" />
                          {t('goals.start')}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="container mx-auto px-6 pb-28">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row">
            <Card className="flex-1 overflow-hidden rounded-[32px] border border-border/30 bg-background/70 p-8 shadow-xl">
              <CardHeader className="space-y-4 p-0">
                <Badge variant="outline" className="w-fit rounded-full border-secondary/40 bg-secondary/10 px-4 py-1.5 text-sm text-secondary">
                  {t('spotlight.badge')}
                </Badge>
                <div className="space-y-3">
                  <CardTitle className="text-3xl text-foreground">{t('spotlight.title')}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {t('spotlight.description')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-0 pt-6">
                <ul className="space-y-3 text-base text-muted-foreground">
                  {spotlightResources.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="break-words">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="gap-2 self-start" asChild>
                  <Link href={buildHref('/library')}>
                    <ArrowRight className="h-5 w-5" />
                    {t('spotlight.cta')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-10 text-center">
          <p className="text-base text-muted-foreground">
            Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
