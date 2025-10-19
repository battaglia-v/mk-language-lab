'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import AuthGuard from '@/components/auth/AuthGuard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { useActiveJourney } from '@/hooks/use-active-journey';
import { JOURNEY_DEFINITIONS } from '@/data/journeys';
import { practiceCardSectionLookup } from '@/data/practice';

export default function TutorPage() {
  const t = useTranslations('tutor');
  const journeyCardT = useTranslations('journey');
  const journeyDetailT = useTranslations('journeyDetail');
  const locale = useLocale();
  const { activeJourney } = useActiveJourney();

  const journeyInfo = useMemo(() => {
    if (!activeJourney) {
      return null;
    }

    const focusRaw = journeyDetailT.raw(`goals.${activeJourney}.focus`);
    const defaultCardId = JOURNEY_DEFINITIONS[activeJourney].practiceRecommendations[0]?.cardId;
    const defaultSection = defaultCardId ? practiceCardSectionLookup[defaultCardId] : 'translation';

    const queryParams = new URLSearchParams({ section: defaultSection });
    if (defaultCardId) {
      queryParams.set('card', defaultCardId);
    }

    return {
      id: activeJourney,
      title: journeyCardT(`goals.cards.${activeJourney}.title`),
      intro: journeyDetailT(`goals.${activeJourney}.intro`),
      focus: Array.isArray(focusRaw) ? (focusRaw as string[]) : [],
      detailHref: `/${locale}/journey/${JOURNEY_DEFINITIONS[activeJourney].slug}`,
      practiceHref: `/${locale}/practice?${queryParams.toString()}`,
    };
  }, [activeJourney, journeyCardT, journeyDetailT, locale]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
          </div>

          <Card className="max-w-3xl mx-auto w-full text-center border-border/60 bg-card/60 backdrop-blur p-8">
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-sm text-primary">
              {t('comingSoonBadge')}
            </div>
            <h2 className="mt-5 text-2xl md:text-3xl font-semibold text-foreground">{t('comingSoonTitle')}</h2>
            <p className="mt-3 text-base md:text-lg text-muted-foreground">{t('comingSoonDescription')}</p>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-center gap-3">
              <Button asChild>
                <Link href={`/${locale}/practice`}>{t('comingSoonPrimary')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/translate`}>{t('comingSoonSecondary')}</Link>
              </Button>
            </div>
          </Card>

          <div className="max-w-4xl mx-auto w-full mt-10">
            {journeyInfo ? (
              <Card className="border-border/50 bg-card/60 backdrop-blur p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm text-primary">
                      <Compass className="h-4 w-4" />
                      <span>{t('journeyContextTitle')}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{journeyInfo.title}</h3>
                      <p className="text-sm text-muted-foreground">{journeyInfo.intro}</p>
                      {journeyInfo.focus.length ? (
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {journeyInfo.focus.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <Button variant="outline" asChild>
                      <Link href={journeyInfo.detailHref}>{t('journeyContextReview')}</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href={journeyInfo.practiceHref}>{t('journeyContextPractice')}</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-dashed border-border/50 bg-card/40 p-5 text-center">
                <div className="flex flex-col gap-3 items-center justify-center">
                  <Compass className="h-6 w-6 text-primary" />
                  <p className="text-sm text-muted-foreground">{t('journeyContextEmpty')}</p>
                  <Button asChild>
                    <Link href={`/${locale}`}>{t('journeyContextCta')}</Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
            <p>
              Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span>
            </p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
