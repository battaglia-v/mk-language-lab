import { notFound, redirect } from 'next/navigation';
import { getReaderSample } from '@/lib/reader-samples';
import { auth } from '@/lib/auth';
import { hasProSubscription } from '@/lib/subscription';
import { ReaderV2Client } from './ReaderV2Client';

interface ReaderV2PageProps {
  params: Promise<{
    locale: string;
    sampleId: string;
  }>;
}

export default async function ReaderV2Page({ params }: ReaderV2PageProps) {
  const { locale, sampleId } = await params;
  const sample = getReaderSample(sampleId);

  if (!sample) {
    notFound();
  }

  // Paywall check
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
        `/${locale}/sign-in?callbackUrl=${encodeURIComponent(`/${locale}/reader/samples/${sampleId}/v2`)}`
      );
    }

    const isPro = await hasProSubscription(session.user.id);
    if (!isPro) {
      redirect(`/${locale}/upgrade?from=${encodeURIComponent(`/${locale}/reader`)}`);
    }
  }

  return (
    <ReaderV2Client
      sample={sample}
      locale={locale}
      sampleId={sampleId}
    />
  );
}
