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
    <section className="section-container section-container-xl section-spacing-lg">
      <div className="mx-auto max-w-6xl">
        <DailyLessons limit={24} />
      </div>
    </section>
  );
}
