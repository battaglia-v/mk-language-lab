"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, MapPin, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TRACK_ORDER = ['everyday', 'situational', 'expansion'] as const;

const trackIcons = {
  everyday: BookOpen,
  situational: MapPin,
  expansion: Sparkles,
};

const trackGradients = {
  everyday: 'from-pink-500 to-rose-500',
  situational: 'from-sky-500 to-blue-500',
  expansion: 'from-purple-500 to-indigo-500',
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

type StarterDeck = {
  title: string;
  description: string;
  focus: string;
  href: string;
};

type NextAction = {
  title: string;
  description: string;
  href: string;
};

export default function VocabularyModulePage() {
  const t = useTranslations('learnVocabulary');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const objectives = t.raw('objectives') as string[];
  const howTo = t.raw('howTo') as string[];
  const tracksContent = t.raw('tracks') as Record<(typeof TRACK_ORDER)[number], ModuleTrack>;
  const activities = t.raw('activities') as ModuleActivity[];
  const resources = (t.raw('resources') as ModuleResource[]).map((resource) => ({
    ...resource,
    href: resource.href.startsWith('/') ? `/${locale}${resource.href}` : resource.href,
  }));
  const starterDecks = (t.raw('starterDecks') as StarterDeck[]).map((deck) => ({
    ...deck,
    href: deck.href.startsWith('/') ? `/${locale}${deck.href}` : deck.href,
  }));
  const nextActions = (t.raw('nextActions') as NextAction[]).map((action) => ({
    ...action,
    href: action.href.startsWith('/') ? `/${locale}${action.href}` : action.href,
  }));
  const journeyKey = searchParams.get('journey');
  const journeyHref = journeyKey ? `/${locale}/journey/${journeyKey}` : `/${locale}/learn`;
  const primaryActionHref = nextActions[0]?.href ?? `/${locale}/practice`;

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

        <Card className="border-border/40 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle>{t('howToHeading')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-none space-y-3 text-sm text-muted-foreground">
              {howTo.map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-lg border border-border/30 bg-muted/30 p-4">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
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

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground">{t('starterDecksHeading')}</h2>
            <p className="text-muted-foreground">{t('starterDecksDescription')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {starterDecks.map((deck) => (
              <Link
                key={deck.title}
                href={deck.href}
                className="group rounded-xl border border-border/30 bg-card/70 p-5 transition-transform hover:-translate-y-1 hover:border-primary/40"
              >
                <p className="text-sm uppercase tracking-wide text-muted-foreground">{deck.focus}</p>
                <p className="mt-2 text-lg font-semibold text-foreground group-hover:text-primary">{deck.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{deck.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  {t('tryNow')}
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">{t('nextActionsHeading')}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {nextActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="rounded-xl border border-border/30 bg-card/60 p-5 transition-colors hover:border-primary/40"
              >
                <p className="text-lg font-semibold text-foreground">{action.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href={journeyHref}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('returnToJourney')}
            </Button>
          </Link>
          <Link href={primaryActionHref}>
            <Button className="gap-2">
              {t('tryNow')}
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
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
