'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  const features = [
    t('feature1'),
    t('feature2'),
    t('feature3'),
    t('feature4'),
  ];

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6">
        <section data-testid="about-hero" className="glass-card rounded-3xl p-6 md:p-8 text-center">
          <header className="page-header mx-auto">
            <div className="page-header-content">
              <p className="page-header-badge">{t('title')}</p>
              <h1 className="page-header-title">{t('subtitle')}</h1>
              <p className="page-header-subtitle mx-auto">{t('description')}</p>
            </div>
          </header>
        </section>

        <section data-testid="about-features">
          <Card className="glass-card rounded-3xl p-6 md:p-8">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{t('features')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-muted-foreground">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-primary mt-0.5" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section data-testid="about-creator" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">{t('author')}</h2>
          </div>
          <Card className="glass-card rounded-3xl p-6 text-center mx-auto max-w-md">
            <CardHeader className="flex flex-col items-center space-y-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-xl bg-primary/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/vinny-profile.png"
                  alt="Vincent Battaglia"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="flex items-center justify-center h-full w-full text-2xl font-bold text-primary">VB</span>';
                    }
                  }}
                />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">Vincent (&quot;Vinny&quot;) Battaglia</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t('vincentRole')}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{t('vincentBio')}</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <a
                  href="https://www.linkedin.com/in/vincentvinnybattaglia/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                  data-testid="about-linkedin"
                >
                  LinkedIn
                </a>
                <a
                  href="https://www.instagram.com/battagliavinny/"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                  data-testid="about-instagram"
                >
                  Instagram
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <section data-testid="about-credits" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">{t('creditsTitle')}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
            <Card className="glass-card rounded-3xl p-6 text-center">
              <CardContent className="pt-4">
                <p className="text-muted-foreground">{t('creditsContent')}</p>
              </CardContent>
            </Card>
            <Card className="glass-card rounded-3xl p-6 text-center">
              <CardContent className="pt-4">
                <p className="text-muted-foreground">{t('andriCredit')}</p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}
