import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Blocks,
  BookOpen,
  Bot,
  Languages,
  LayoutDashboard,
  MessageSquare,
  Mic2,
  Newspaper,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');
  const navT = useTranslations('nav');
  const learnT = useTranslations('learn');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const heroHighlights = [
    { label: t('heroHighlight1'), icon: Sparkles },
    { label: t('heroHighlight2'), icon: Bot },
    { label: t('heroHighlight3'), icon: Newspaper },
  ];

  const stats = [
    { value: t('statLessonsValue'), label: t('statLessons') },
    { value: t('statResourcesValue'), label: t('statResources') },
    { value: t('statCommunityValue'), label: t('statCommunity') },
  ];

  const modules = [
    {
      title: learnT('vocabulary'),
      description: learnT('vocabularyDesc'),
      path: '/learn/vocabulary',
      icon: BookOpen,
      accent: 'from-pink-500/70 via-purple-500/70 to-pink-500/40',
    },
    {
      title: learnT('grammar'),
      description: learnT('grammarDesc'),
      path: '/learn/grammar',
      icon: Blocks,
      accent: 'from-cyan-500/70 via-blue-500/70 to-cyan-500/40',
    },
    {
      title: learnT('phrases'),
      description: learnT('phrasesDesc'),
      path: '/learn/phrases',
      icon: MessageSquare,
      accent: 'from-amber-500/70 via-orange-500/70 to-amber-500/40',
    },
    {
      title: learnT('pronunciation'),
      description: learnT('pronunciationDesc'),
      path: '/learn/pronunciation',
      icon: Mic2,
      accent: 'from-emerald-500/70 via-teal-500/70 to-emerald-500/40',
    },
  ];

  const featureCards = [
    {
      title: t('newsCardTitle'),
      description: t('newsCardDesc'),
      cta: t('ctaNews'),
      path: '/news',
      icon: Newspaper,
      accent: 'from-sky-500/80 via-blue-500/70 to-sky-400/50',
    },
    {
      title: t('tutorCardTitle'),
      description: t('tutorCardDesc'),
      cta: t('ctaTutor'),
      path: '/tutor',
      icon: Bot,
      accent: 'from-purple-500/80 via-fuchsia-500/70 to-purple-400/50',
    },
    {
      title: t('tasksCardTitle'),
      description: t('tasksCardDesc'),
      cta: t('ctaTasks'),
      path: '/tasks',
      icon: LayoutDashboard,
      accent: 'from-emerald-500/80 via-lime-500/70 to-emerald-400/50',
    },
  ];

  const quickLinks = [
    {
      title: navT('translate'),
      description: t('translateDesc'),
      icon: Languages,
      path: '/translate',
      gradient: 'from-orange-500/80 via-red-500/70 to-orange-400/50',
    },
    {
      title: navT('resources'),
      description: t('resourcesDesc'),
      icon: BookOpen,
      path: '/resources',
      gradient: 'from-indigo-500/80 via-violet-500/70 to-indigo-400/50',
    },
    {
      title: navT('learn'),
      description: t('learnDesc'),
      icon: Sparkles,
      path: '/learn',
      gradient: 'from-pink-500/80 via-rose-500/70 to-pink-400/50',
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
                <Link href={buildHref('/learn')}>{t('ctaLearn')}</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base md:text-lg" asChild>
                <Link href={buildHref('/resources')}>{t('ctaExplore')}</Link>
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

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-border/50 bg-card/70 backdrop-blur text-center">
                <CardContent className="py-8">
                  <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-5xl space-y-8 text-center md:text-left">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-foreground">{t('modulesHeading')}</h2>
            <p className="text-base text-muted-foreground md:max-w-2xl">{t('modulesDescription')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.path} href={buildHref(module.path)}>
                  <Card className="group h-full overflow-hidden border-border/50 bg-card/60 backdrop-blur transition-transform duration-200 hover:-translate-y-1">
                    <CardHeader className="space-y-4">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${module.accent} text-background shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
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

      <section className="container mx-auto px-4 pb-24">
        <div className="mx-auto max-w-5xl space-y-6 text-center md:text-left">
          <h2 className="text-3xl font-semibold text-foreground">{t('quickLinks')}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} href={buildHref(link.path)}>
                  <Card className="h-full overflow-hidden border-border/50 bg-card/60 backdrop-blur transition-transform duration-200 hover:-translate-y-1">
                    <CardHeader className="space-y-3">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${link.gradient} text-background shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg text-foreground">{link.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {link.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
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
