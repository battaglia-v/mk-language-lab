import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Blocks, Columns, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TRACK_ORDER = ['structure', 'cases', 'verbs'] as const;

const trackIcons = {
  structure: Columns,
  cases: Blocks,
  verbs: RefreshCcw,
};

const trackGradients = {
  structure: 'from-blue-500 to-indigo-500',
  cases: 'from-amber-500 to-orange-500',
  verbs: 'from-emerald-500 to-teal-500',
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

export default function GrammarModulePage() {
  const t = useTranslations('learnGrammar');
  const locale = useLocale();

  const objectives = t.raw('objectives') as string[];
  const tracksContent = t.raw('tracks') as Record<(typeof TRACK_ORDER)[number], ModuleTrack>;
  const activities = t.raw('activities') as ModuleActivity[];
  const resources = (t.raw('resources') as ModuleResource[]).map((resource) => ({
    ...resource,
    href: resource.href.startsWith('/') ? `/${locale}${resource.href}` : resource.href,
  }));

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
