import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  const features = [
    t('feature1'),
    t('feature2'),
    t('feature3'),
    t('feature4'),
    t('feature5'),
    t('feature6'),
  ];

  return (
    <div className="section-container section-container-xl section-spacing-lg">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <Badge variant="outline" className="text-base px-4 py-2">
            {t('subtitle')}
          </Badge>
        </div>

        {/* Description */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">{t('description')}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">{t('features')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Team */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{t('meetTheTeam')}</h2>
            <p className="text-muted-foreground">{t('teamDescription')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vincent */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">{t('vincent')}</CardTitle>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                  Винсент Баталија
                </div>
                <p className="text-muted-foreground text-sm">{t('vincentRole')}</p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm">{t('vincentBio')}</p>
              </CardContent>
            </Card>

            {/* Andri */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">{t('andri')}</CardTitle>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                  🇲🇰 Andri
                </div>
                <p className="text-muted-foreground text-sm">{t('andriRole')}</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm">{t('andriBio')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href="https://macedonianlanguagecorner.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    {t('andriWebsite')}
                  </a>
                  <a
                    href="https://instagram.com/macedonianlanguagecorner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    {t('andriInstagram')}
                  </a>
                  <a
                    href="https://youtube.com/@macedonianlanguagecorner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    {t('andriYouTube')}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
