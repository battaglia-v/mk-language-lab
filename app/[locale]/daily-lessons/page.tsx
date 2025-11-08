import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DailyLessons } from '@/components/learn/DailyLessons';

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

export default function DailyLessonsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <section className="w-full py-12">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <DailyLessons limit={24} />
          </div>
        </div>
      </section>
    </div>
  );
}
