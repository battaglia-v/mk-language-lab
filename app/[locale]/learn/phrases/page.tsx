import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, MessageCircle, Plane, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isJourneyId } from '@/data/journeys';
import { JOURNEY_PRACTICE_CONTENT } from '@/data/journey-practice-content';

const TRACK_ORDER = ['introductions', 'travel', 'social'] as const;

const trackIcons = {
  introductions: MessageCircle,
  travel: Plane,
  social: Users,
};

const trackGradients = {
  introductions: 'from-pink-500 to-fuchsia-500',
  travel: 'from-cyan-500 to-blue-500',
  social: 'from-amber-500 to-rose-500',
};

type ModuleTrack = {
  title: string;
  description: string;
  items: string[];
};

type ModuleActivity = {
  title: string;
  description: string;
};

type ModuleResource = {
  title: string;
  description: string;
  href: string;
};

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function PhrasesModulePage({ searchParams }: PageProps) {
  const t = useTranslations('learnPhrases');
  const journeyT = useTranslations('journey');
  const locale = useLocale();

  const objectives = t.raw('objectives') as string[];
  const tracksContent = t.raw('tracks') as Record<(typeof TRACK_ORDER)[number], ModuleTrack>;
  const activities = t.raw('activities') as ModuleActivity[];
  const resources = (t.raw('resources') as ModuleResource[]).map((resource) => ({
    ...resource,
    href: resource.href.startsWith('/') ? `/${locale}${resource.href}` : resource.href,
  }));

  const journeyParam = typeof searchParams?.journey === 'string' ? searchParams.journey : null;
  const journeyId = journeyParam && isJourneyId(journeyParam) ? journeyParam : null;
  const journeyTitle = journeyId ? journeyT(`goals.cards.${journeyId}.title`) : null;
  const journeyPhrases = journeyId ? JOURNEY_PRACTICE_CONTENT[journeyId]?.phrases ?? [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <Link
          href={`/${locale}/learn`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>

        <section className="max-w-3xl space-y-4">
          <Badge variant="secondary" className="w-fit">
            {t('badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </section>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle>{t('objectivesHeading')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2">
              {objectives.map((objective) => (
                <li
                  key={objective}
                  className="rounded-lg border border-border/40 bg-muted/40 p-4 text-sm text-muted-foreground"
                >
                  {objective}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">{t('tracksHeading')}</h2>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TRACK_ORDER.map((trackKey) => {
              const Icon = trackIcons[trackKey];
              const track = tracksContent[trackKey];
              const gradient = trackGradients[trackKey];

              return (
                <Card key={trackKey} className="border-border/40 bg-card/70 backdrop-blur">
                  <CardHeader>
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{track.title}</CardTitle>
                    <CardDescription>{track.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {track.items.map((item) => (
                        <li key={item} className="rounded-md bg-muted/40 px-3 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {journeyId && journeyPhrases.length ? (
          <Card className="border-border/40 bg-card/70 backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-foreground">
                {t('journeyPracticeHeading', { journey: journeyTitle ?? '' })}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {t('journeyPracticeSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('journeyPracticeNote')}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="pb-2 pr-4 font-semibold">{t('journeyPracticeTable.situation')}</th>
                      <th className="pb-2 pr-4 font-semibold">{t('journeyPracticeTable.macedonian')}</th>
                      <th className="pb-2 pr-4 font-semibold">{t('journeyPracticeTable.english')}</th>
                      <th className="pb-2 font-semibold">{t('journeyPracticeTable.tip')}</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    {journeyPhrases.map((phrase) => (
                      <tr key={phrase.id} className="border-t border-border/40">
                        <td className="py-3 pr-4 font-medium text-foreground">{phrase.situation}</td>
                        <td className="py-3 pr-4 text-foreground">{phrase.macedonian}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{phrase.english}</td>
                        <td className="py-3 text-muted-foreground">{phrase.tip ?? '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/40 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle>{t('activitiesHeading')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.title} className="rounded-lg border border-border/30 bg-muted/30 p-4">
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle>{t('resourcesHeading')}</CardTitle>
              <CardDescription>{t('subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="block rounded-lg border border-border/30 bg-muted/30 p-4 transition-colors hover:border-primary/50"
                >
                  <p className="font-medium text-foreground">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
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
