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
    t('feature5'),
    t('feature6'),
  ];

  return (
    <div className="page-shell">
      <div className="page-shell-content section-container section-container-xl section-spacing-md space-y-6 text-white">
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
              <CardTitle className="text-2xl text-white">{t('features')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-slate-200">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section data-testid="about-team" className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">{t('meetTheTeam')}</h2>
            <p className="text-slate-300">{t('teamDescription')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: 'vincent', name: '🇺🇸 Винсент Баталија', role: t('vincentRole'), bio: t('vincentBio') },
              { id: 'andri', name: '🇲🇰 Андри', role: t('andriRole'), bio: t('andriBio') },
            ].map((member) => (
              <Card key={member.id} className="glass-card rounded-3xl p-6 text-center">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{t(member.id as 'vincent' | 'andri')}</CardTitle>
                  <p className="text-3xl font-semibold text-white">{member.name}</p>
                  <p className="text-sm text-slate-300">{member.role}</p>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-200">
                  <p>{member.bio}</p>
                  {member.id === 'vincent' && (
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <a
                        href="https://www.linkedin.com/in/vincentvinnybattaglia/"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {member.id === 'andri' && (
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <a
                        href="https://macedonianlanguagecorner.com"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        {t('andriWebsite')}
                      </a>
                      <a
                        href="https://instagram.com/macedonianlanguagecorner"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        {t('andriInstagram')}
                      </a>
                      <a
                        href="https://youtube.com/@macedonianlanguagecorner"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                      >
                        {t('andriYouTube')}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
