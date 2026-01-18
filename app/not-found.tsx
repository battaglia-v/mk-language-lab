'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global 404 Not Found Page
 * 
 * Displays a user-friendly error page when a route doesn't exist.
 * This catches all 404 errors at the app level.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/en/learn">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Lessons
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Help text */}
        <p className="text-sm text-muted-foreground pt-4">
          If you believe this is an error, please{' '}
          <Link href="/en/feedback" className="text-primary hover:underline">
            let us know
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
