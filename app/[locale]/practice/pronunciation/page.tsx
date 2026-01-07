'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from '@/components/layout';
import { ROUTES, buildLocalizedRoute } from '@/lib/routes';

export default function PronunciationPracticePage() {
  const locale = useLocale();

  return (
    <PageContainer size="sm" className="flex flex-col items-center justify-center min-h-[60vh] gap-6 pb-24 sm:pb-8">
      <Card className="border-accent/20 bg-accent/5 text-center max-w-md">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-accent/10 p-4">
              <Volume2 className="h-8 w-8 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pronunciation Practice</CardTitle>
          <CardDescription className="text-base mt-2">
            Coming soon — we&apos;re recording audio with native speakers to bring you the most authentic pronunciation experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="default" className="w-full">
            <Link href={buildLocalizedRoute(locale, ROUTES.PRACTICE)}>
              Return to Practice
            </Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
