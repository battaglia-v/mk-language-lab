'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function GrammarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  
  useEffect(() => {
    // Log error to console for debugging
    console.error('[Grammar Practice Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an error while loading the grammar lesson. This has been reported and we&apos;re working on it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="rounded-lg border border-border bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground">{error.message}</p>
              {error.digest && (
                <p className="mt-1 text-xs text-muted-foreground">Error ID: {error.digest}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={reset}
            className="w-full gap-2 sm:flex-1"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href={`/${locale}/practice`} className="w-full sm:flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Back to Practice
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
