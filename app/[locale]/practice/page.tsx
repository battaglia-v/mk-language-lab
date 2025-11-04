'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActiveJourney } from '@/hooks/use-active-journey';
import { useJourneyProgress } from '@/hooks/use-journey-progress';
import { getPrimaryJourneyPracticeCard } from '@/data/journeys';
import {
  PRACTICE_SECTIONS,
  PracticeSection,
  practiceCardsBySection,
  practiceCardSectionLookup,
  isPracticeSection,
  isPracticeCardId,
  PracticeCardId,
  type PracticeCard,
} from '@/data/practice';

const ESTIMATED_PRACTICE_DURATION_MINUTES = 12;

export default function PracticeHubPage() {
  const t = useTranslations('practiceHub');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { activeJourney } = useActiveJourney();
  const { logSession } = useJourneyProgress(activeJourney);

  const cardParam = searchParams.get('card');
  const sectionParam = searchParams.get('section');

  const journeyDefaultCard = useMemo(() => {
    if (!activeJourney) {
      return null;
    }

    return getPrimaryJourneyPracticeCard(activeJourney);
  }, [activeJourney]);

  const recommendedCard: PracticeCardId | null = useMemo(() => {
    if (isPracticeCardId(cardParam)) {
      return cardParam;
    }

    return journeyDefaultCard;
  }, [cardParam, journeyDefaultCard]);

  const initialSection: PracticeSection = useMemo(() => {
    if (isPracticeSection(sectionParam)) {
      return sectionParam;
    }

    if (recommendedCard) {
      return practiceCardSectionLookup[recommendedCard];
    }

    return PRACTICE_SECTIONS[0];
  }, [sectionParam, recommendedCard]);

  const [activeSection, setActiveSection] = useState<PracticeSection>(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const buildHref = useCallback(
    (path: string) => (path.startsWith('/') ? `/${locale}${path}` : `/${locale}/${path}`),
    [locale]
  );

  const buildCardHref = useCallback(
    (card: PracticeCard) => {
      const baseHref = buildHref(card.href);

      if (!activeJourney) {
        return baseHref;
      }

      if (card.href.includes('journey=')) {
        return baseHref;
      }

      const hasQuery = card.href.includes('?');
      const separator = hasQuery ? '&' : '?';
      return `${baseHref}${separator}journey=${activeJourney}`;
    },
    [activeJourney, buildHref]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <div className="space-y-4 text-center md:text-left">
            <Badge variant="outline" className="mx-auto w-fit border-primary/40 bg-primary/10 text-primary md:mx-0">
              {t('badge')}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{t('title')}</h1>
            <p className="text-lg text-muted-foreground md:text-xl">{t('subtitle')}</p>
          </div>

          <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as PracticeSection)} className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-2 bg-card/50 p-1 sm:grid-cols-3 h-auto">
              {PRACTICE_SECTIONS.map((section) => (
                <TabsTrigger key={section} value={section} className="h-auto min-h-[2.75rem] py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <span className="break-words text-center">{t(`${section}.tabLabel`)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {PRACTICE_SECTIONS.map((section) => (
              <TabsContent key={section} value={section} className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">{t(`${section}.description`)}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {practiceCardsBySection[section].map((card) => {
                    const Icon = card.icon;
                    const isRecommended = recommendedCard === card.id;

                    return (
                      <Card
                        key={card.id}
                        className={`border-border/60 bg-card/70 backdrop-blur ${
                          isRecommended ? 'border-primary/70 ring-1 ring-primary/40 shadow-lg' : ''
                        }`}
                      >
                        <CardHeader className="space-y-3">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 via-secondary/80 to-primary/40 text-primary-foreground">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-xl text-foreground break-words">{t(card.titleKey)}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground break-words">
                              {t(card.descriptionKey)}
                            </CardDescription>
                          </div>
                          {isRecommended ? (
                            <Badge variant="outline" className="border-primary/60 text-primary">
                              {t('recommendedBadge')}
                            </Badge>
                          ) : null}
                        </CardHeader>
                        <CardContent>
                          {isRecommended ? (
                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-primary">
                              {t('recommendedHint')}
                            </p>
                          ) : null}
                          <Button variant="outline" className="gap-2" asChild>
                            <Link
                              href={buildCardHref(card)}
                              onClick={() =>
                                logSession({ durationMinutes: ESTIMATED_PRACTICE_DURATION_MINUTES })
                              }
                            >
                              {t('openAction')}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
