'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * WordSprintSession - Coming soon placeholder
 */
export function WordSprintSession() {
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center">
        <Zap className="h-10 w-10 text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Word Sprint</h1>
      <p className="text-muted-foreground mb-6">
        Coming soon! Race against the clock to match words.
      </p>
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={() => router.push(`/${locale}/practice`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Practice
      </Button>
    </div>
  );
}
