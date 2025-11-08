import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertCircle, Scale, Users, Ban, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const t = useTranslations('terms');
  const locale = useLocale();

  const sections = [
    {
      icon: FileText,
      title: t('section1.title'),
      content: t('section1.content'),
      items: t.raw('section1.items') as string[],
    },
    {
      icon: Users,
      title: t('section2.title'),
      content: t('section2.content'),
      items: t.raw('section2.items') as string[],
    },
    {
      icon: Scale,
      title: t('section3.title'),
      content: t('section3.content'),
      items: t.raw('section3.items') as string[],
    },
    {
      icon: Ban,
      title: t('section4.title'),
      content: t('section4.content'),
      items: t.raw('section4.items') as string[],
    },
    {
      icon: AlertCircle,
      title: t('section5.title'),
      content: t('section5.content'),
    },
    {
      icon: RefreshCw,
      title: t('section6.title'),
      content: t('section6.content'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Scale className="h-3 w-3 mr-1" />
            {t('badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
          <p className="text-sm text-muted-foreground mt-2">{t('lastUpdated')}</p>
        </div>

        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <p className="text-base leading-relaxed">{t('introduction')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  {section.items && (
                    <ul className="space-y-2 ml-4">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Third-Party Services */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                {t('section7.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{t('section7.content')}</p>
              <ul className="space-y-2 ml-4">
                {(t.raw('section7.services') as Array<{name: string, purpose: string}>).map((service, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{service.name}:</span> {service.purpose}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="h-5 w-5 text-primary" />
                {t('contact.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">{t('contact.content')}</p>
              <a
                href="mailto:vincent.battaglia@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                vincent.battaglia@gmail.com
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Footer Navigation */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${locale}/privacy`}
              className="text-primary hover:underline font-medium"
            >
              {t('viewPrivacy')}
            </Link>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <Link
              href={`/${locale}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
