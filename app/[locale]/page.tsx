import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, MessageSquare, Languages, FolderOpen, Trello } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');
  const navT = useTranslations('nav');
  const locale = useLocale();

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const quickLinks = [
    {
      title: navT('learn'),
      description: t('learnDesc'),
      icon: BookOpen,
      path: '/learn',
      gradient: 'from-pink-500 to-purple-500',
    },
    {
      title: navT('tutor'),
      description: t('tutorDesc'),
      icon: MessageSquare,
      path: '/tutor',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: navT('translate'),
      description: t('translateDesc'),
      icon: Languages,
      path: '/translate',
      gradient: 'from-pink-500 to-orange-500',
    },
    {
      title: navT('resources'),
      description: t('resourcesDesc'),
      icon: FolderOpen,
      path: '/resources',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: navT('tasks'),
      description: t('tasksDesc'),
      icon: Trello,
      path: '/tasks',
      gradient: 'from-cyan-500 to-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
              {t('title')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg" asChild>
              <Link href={buildHref('/learn')}>
                {t('getStarted')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">{t('quickLinks')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} href={buildHref(link.path)}>
                <Card className="h-full hover:scale-[1.02] transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{link.title}</CardTitle>
                    <CardDescription className="text-base">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span></p>
        </div>
      </footer>
    </div>
  );
}
