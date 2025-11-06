"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-destructive">Oops! Something went wrong</h1>
          <p className="text-muted-foreground">
            We apologize for the inconvenience. An error occurred while processing your request.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="rounded-md bg-muted p-4">
            <h2 className="mb-2 font-semibold text-sm">Error Details (Development Only)</h2>
            <pre className="overflow-auto text-xs">
              {error.message}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-center font-medium transition-colors hover:bg-accent"
          >
            Go to Home
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}
