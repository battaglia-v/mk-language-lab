import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DailyLessons } from '@/components/learn/DailyLessons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Instagram, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dailyLessons' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function DailyLessonsPage() {
  const t = await getTranslations('dailyLessons');

  return (
    <PageContainer size="xl" className="flex flex-col gap-5 pb-24 pt-6 sm:gap-6 sm:pb-10 sm:pt-8">
      <section className="glass-card rounded-3xl card-padding-lg md:p-8" data-testid="daily-lessons-hero">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="inline-flex w-fit items-center gap-2 border-primary/40 bg-primary/10 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                <Sparkles className="h-4 w-4" />
                {t('visitInstagram')}
              </Badge>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white md:text-4xl">{t('title')}</h1>
                <p className="text-sm text-slate-300">{t('subtitle')}</p>
              </div>
            </div>
            <Button
              asChild
              className="w-full rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 md:w-auto"
            >
              <a href="https://www.instagram.com/macedonianlanguagecorner" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                {t('visitInstagram')}
              </a>
            </Button>
          </div>
        </section>

      <DailyLessons limit={24} className="rounded-[32px]" dataTestId="daily-lessons-feed" />
    </PageContainer>
  );
}
