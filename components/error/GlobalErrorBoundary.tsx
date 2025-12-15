"use client";

// import * as Sentry from "@sentry/nextjs"; // Disabled - Sentry temporarily removed
import Link from "next/link";
import { useEffect, useState } from "react";
import SupportForm from "@/components/support/SupportForm";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  useEffect(() => {
    // Log the error to Sentry - Disabled temporarily
    // Sentry.captureException(error);
    console.error("[Global Error Boundary]", error);
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
          <Button
            onClick={reset}
            variant="default"
            className="w-full"
          >
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/">
              Go to Home
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => setIsSupportModalOpen(true)}
            variant="link"
            className="text-sm"
          >
            Contact Support
          </Button>
        </div>
      </div>

      {/* Support Form Modal */}
      <SupportForm
        open={isSupportModalOpen}
        onOpenChange={setIsSupportModalOpen}
        errorDetails={{
          message: error.message,
          digest: error.digest,
          stack: error.stack,
        }}
      />
    </div>
  );
}
