'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { practiceCardIndex, type PracticeCard } from '@/data/practice';
import { getJourneyDefinition } from '@/data/journeys';
import { useActiveJourney } from '@/hooks/use-active-journey';
import { ArrowLeft, ArrowRight, Compass, Sparkles } from 'lucide-react';

type PageProps = {
  params: {
    goal: string;
  };
};

export default function JourneyDetailPage({ params }: PageProps) {
  const { goal } = params;

  const locale = useLocale();
  const t = useTranslations('journeyDetail');
  const practiceT = useTranslations('practiceHub');
  const { activeJourney, setActiveJourney, clearActiveJourney } = useActiveJourney();

  const journey = getJourneyDefinition(goal);

  if (!journey) {
    notFound();
  }

  const goalKey = journey.id;
  const isActive = activeJourney === journey.id;

  const focus = Array.isArray(t.raw(`goals.${goalKey}.focus`))
    ? (t.raw(`goals.${goalKey}.focus`) as string[])
    : [];

  const steps = Array.isArray(t.raw(`goals.${goalKey}.steps`))
    ? (t.raw(`goals.${goalKey}.steps`) as string[])
    : [];

  const practiceRecommendations = journey.practiceRecommendations
    .map(({ cardId, reasonKey }) => {
      const card = practiceCardIndex[cardId];

      if (!card) {
        return null;
      }

      return {
        card,
        reason: t(reasonKey),
      };
    })
    .filter((item): item is { card: PracticeCard; reason: string } => item !== null);

  const extrasHeader = t.raw('extras.header') as { title?: string; description?: string } | null;
  const extrasForJourney = t.raw(`extras.${goalKey}`) as
    | {
        exercises?: Array<{ title?: string; description?: string; time?: string }>;
        resources?: Array<{ title?: string; description?: string; href?: string }>;
      }
    | null;

  const extraExercises = Array.isArray(extrasForJourney?.exercises) ? extrasForJourney?.exercises ?? [] : [];
  const extraResources = Array.isArray(extrasForJourney?.resources) ? extrasForJourney?.resources ?? [] : [];

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button variant="ghost" size="sm" className="w-fit gap-2" asChild>
              <Link href={buildHref('/')}
                aria-label={t('backLabel')}
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backLabel')}
              </Link>
            </Button>
            <Badge variant="outline" className="w-fit border-primary/40 bg-primary/5 text-primary">
              {t('badge')}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isActive ? (
              <Badge variant="secondary" className="gap-2 border-primary/50 bg-primary/10 text-primary">
                <Compass className="h-4 w-4" />
                {t('activeBadge')}
              </Badge>
            ) : null}
            <Button
              variant={isActive ? 'outline' : 'default'}
              className="gap-2"
              onClick={() => (isActive ? clearActiveJourney() : setActiveJourney(journey.id))}
            >
              <Compass className="h-4 w-4" />
              {isActive ? t('clearActive') : t('setActive')}
            </Button>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl text-foreground">{t(`goals.${goalKey}.title`)}</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t(`goals.${goalKey}.intro`)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('focusTitle')}</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {focus.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('stepsTitle')}</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {steps.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-lg border border-border/40 bg-background/60 p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {practiceRecommendations.length > 0 ? (
                <section className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground">{t('practiceTitle')}</h2>
                    <p className="text-sm text-muted-foreground">{t('practiceDescription')}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {practiceRecommendations.map(({ card, reason }) => {
                      const Icon = card.icon;
                      const practiceHref = `/practice?card=${card.id}&journey=${journey.id}`;

                      return (
                        <div key={card.id} className="space-y-3 rounded-lg border border-border/40 bg-background/70 p-4">
                          <div className="flex items-start gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">{practiceT(card.titleKey)}</p>
                              <p className="text-xs text-muted-foreground">{practiceT(card.descriptionKey)}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{reason}</p>
                          <Button variant="outline" className="gap-2" asChild>
                            <Link href={buildHref(practiceHref)}>
                              <ArrowRight className="h-4 w-4" />
                              {t('practiceCta')}
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {(extraExercises.length > 0 || extraResources.length > 0) && (
                <section className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground">{extrasHeader?.title ?? ''}</h2>
                    <p className="text-sm text-muted-foreground">{extrasHeader?.description ?? ''}</p>
                  </div>

                  {extraExercises.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('extras.exercisesTitle')}
                      </h3>
                      <div className="space-y-3">
                        {extraExercises.map((exercise, index) => (
                          <div
                            key={`${exercise?.title ?? 'exercise'}-${index}`}
                            className="space-y-2 rounded-lg border border-border/40 bg-background/70 p-4"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-semibold text-foreground">{exercise?.title}</p>
                              {exercise?.time ? (
                                <span className="text-xs font-medium text-muted-foreground">
                                  {t('extras.timeLabel', { minutes: exercise.time })}
                                </span>
                              ) : null}
                            </div>
                            {exercise?.description ? (
                              <p className="text-sm text-muted-foreground">{exercise.description}</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {extraResources.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('extras.resourcesTitle')}
                      </h3>
                      <div className="space-y-3">
                        {extraResources.map((resource, index) => (
                          <div
                            key={`${resource?.title ?? 'resource'}-${index}`}
                            className="space-y-2 rounded-lg border border-border/40 bg-background/70 p-4"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">{resource?.title}</p>
                              {resource?.description ? (
                                <p className="text-sm text-muted-foreground">{resource.description}</p>
                              ) : null}
                            </div>
                            {resource?.href ? (
                              <Button variant="ghost" className="gap-2" asChild>
                                <Link href={buildHref(resource.href)}>
                                  <ArrowRight className="h-4 w-4" />
                                  {t('extras.openLink')}
                                </Link>
                              </Button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              )}

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">{t('previewTitle')}</h2>
                <p className="text-sm text-muted-foreground">{t('comingSoon')}</p>
                <Button className="gap-2" disabled>
                  <Compass className="h-4 w-4" />
                  {t('previewCta')}
                </Button>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
