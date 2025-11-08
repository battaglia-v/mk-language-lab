'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

type PageProps = {
  params: Promise<{
    goal: string;
  }>;
};

export default function JourneyDetailPage({ params }: PageProps) {
  const { goal } = use(params);
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage - journey pages are not yet implemented
    router.replace(`/${locale}`);
  }, [locale, router, goal]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
