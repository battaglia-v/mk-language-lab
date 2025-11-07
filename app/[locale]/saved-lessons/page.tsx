import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SavedLessons } from '@/components/learn/SavedLessons';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'savedLessons' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function SavedLessonsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SavedLessons />
    </div>
  );
}
