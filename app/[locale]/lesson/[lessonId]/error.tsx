'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCcw, Home } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for lesson pages.
 * Provides user-friendly error messages and recovery options.
 */
export default function LessonError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Log to Sentry if enabled
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: { page: 'lesson' },
      });
    }
    console.error('[Lesson Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">Unable to load lesson</h1>
            <p className="text-muted-foreground">
              We couldn&apos;t load this lesson. This might be a temporary issue.
            </p>
          </div>
        </div>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-muted p-4 text-xs">
            <p className="font-semibold mb-1">Error:</p>
            <pre className="overflow-auto whitespace-pre-wrap">{error.message}</pre>
            {error.digest && (
              <p className="mt-2 text-muted-foreground">ID: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/learn`)}
            className="w-full gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Lessons
          </Button>
        </div>
      </Card>
    </div>
  );
}
