import { useTranslations } from 'next-intl';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, BookOpenCheck, MessageCircle, Volume2 } from 'lucide-react';

export default function LearnPage() {
  const t = useTranslations('learn');

  const modules = [
    {
      title: t('vocabulary'),
      description: t('vocabularyDesc'),
      icon: BookOpen,
      gradient: 'from-pink-500 to-rose-500',
      href: '/learn/vocabulary',
    },
    {
      title: t('grammar'),
      description: t('grammarDesc'),
      icon: BookOpenCheck,
      gradient: 'from-purple-500 to-indigo-500',
      href: '/learn/grammar',
    },
    {
      title: t('phrases'),
      description: t('phrasesDesc'),
      icon: MessageCircle,
      gradient: 'from-cyan-500 to-blue-500',
      href: '/learn/phrases',
    },
    {
      title: t('pronunciation'),
      description: t('pronunciationDesc'),
      icon: Volume2,
      gradient: 'from-orange-500 to-amber-500',
      href: '/learn/pronunciation',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Learning Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.href}
                className="hover:scale-[1.02] transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{module.title}</CardTitle>
                  <CardDescription className="text-base pt-2">{module.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Practice Widget */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-card/80 to-muted/30 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">{t('quickPractice')}</CardTitle>
              <CardDescription className="text-base">{t('translateAndPractice')}</CardDescription>
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="bg-background/50 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  {t('enterText')}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Coming soon...
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Креирано од <span className="font-semibold text-foreground">Винсент Баталија</span></p>
        </div>
      </footer>
    </div>
  );
}
