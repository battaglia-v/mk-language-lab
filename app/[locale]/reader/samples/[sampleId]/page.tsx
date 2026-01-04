import { notFound, redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout';
import { getReaderSample } from '@/lib/reader-samples';
import { ReaderLayout } from '@/components/reader/ReaderLayout';
import { auth } from '@/lib/auth';
import { hasProSubscription } from '@/lib/subscription';

interface ReadingSamplePageProps {
  params: Promise<{
    locale: string;
    sampleId: string;
  }>;
}

export default async function ReadingSamplePage({ params }: ReadingSamplePageProps) {
  const { locale, sampleId } = await params;
  const sample = getReaderSample(sampleId);

  if (!sample) {
    notFound();
  }

  const dayNumber = Number.parseInt(sample.attribution.day ?? '', 10);
  const isPremiumChallengeDay =
    sample.tags.includes('30-day-challenge') &&
    Number.isFinite(dayNumber) &&
    dayNumber >= 6;

  const paywallEnabled = process.env.ENABLE_PAYWALL === 'true';

  if (paywallEnabled && isPremiumChallengeDay) {
    const session = await auth().catch(() => null);

    if (!session?.user?.id) {
      redirect(
        `/${locale}/sign-in?callbackUrl=${encodeURIComponent(`/${locale}/reader/samples/${sampleId}`)}`
      );
    }

    const isPro = await hasProSubscription(session.user.id);
    if (!isPro) {
      redirect(`/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/reader`)}`);
    }
  }

  return (
    <PageContainer size="content" className="pb-24 sm:pb-10">
      <ReaderLayout sample={sample} locale={locale} />
    </PageContainer>
  );
}
