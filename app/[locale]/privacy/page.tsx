import { useTranslations, useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Globe, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacy');
  const locale = useLocale();

  const sections = [
    { icon: Database, title: t('section1.title'), content: t('section1.content'), items: t.raw('section1.items') as string[] },
    { icon: Lock, title: t('section2.title'), content: t('section2.content'), items: t.raw('section2.items') as string[] },
    { icon: Eye, title: t('section3.title'), content: t('section3.content'), items: t.raw('section3.items') as string[] },
    { icon: Globe, title: t('section4.title'), content: t('section4.content') },
    { icon: Shield, title: t('section5.title'), content: t('section5.content'), items: t.raw('section5.items') as string[] },
    { icon: Globe, title: t('section7.title'), content: t('section7.content'), items: t.raw('section7.items') as string[] },
  ];

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6 text-white">
        <section data-testid="privacy-hero" className="glass-card rounded-3xl p-6 md:p-8 text-center">
          <p className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Shield className="h-4 w-4" />
            {t('badge')}
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">{t('title')}</h1>
          <p className="mt-2 text-slate-300">{t('subtitle')}</p>
          <p className="text-sm text-slate-400">{t('lastUpdated')}</p>
        </section>

        <section data-testid="privacy-content" className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="glass-card rounded-3xl p-6 md:p-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-white">
                    <Icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-200">
                  <p className="leading-relaxed">{section.content}</p>
                  {section.items && (
                    <ul className="space-y-2 ml-4">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start">
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

          <Card className="glass-card rounded-3xl p-6 md:p-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Database className="h-5 w-5 text-primary" />
                {t('section6.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200">
              <p className="leading-relaxed">{t('section6.content')}</p>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6 md:p-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Shield className="h-5 w-5 text-primary" />
                {t('gdpr.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-200">
              <p className="leading-relaxed">{t('gdpr.content')}</p>
              <ul className="space-y-2 ml-4">
                {(t.raw('gdpr.rights') as string[]).map((right, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>{right}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-3xl p-6 md:p-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Mail className="h-5 w-5 text-primary" />
                {t('contact.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200">
              <p className="leading-relaxed mb-4">{t('contact.content')}</p>
              <a
                href="mailto:contact@mklanguage.com?subject=Privacy%20Policy%20Inquiry%20-%20Macedonian%20Learning%20App"
                className="text-primary hover:underline font-semibold"
                data-testid="privacy-contact-email"
              >
                Contact Us
              </a>
            </CardContent>
          </Card>
        </section>

        <div className="text-center text-slate-300">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={`/${locale}/terms`} className="text-primary hover:underline font-medium" data-testid="privacy-view-terms">
              {t('viewTerms')}
            </Link>
            <span className="hidden sm:inline text-slate-500">•</span>
            <Link href={`/${locale}`} className="text-slate-400 hover:text-white transition-colors" data-testid="privacy-back-home">
              {t('backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
