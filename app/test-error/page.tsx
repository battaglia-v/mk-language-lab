"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

/**
 * Test Error Boundary Page - For testing error handling
 *
 * GATED: Only available when NEXT_PUBLIC_ENABLE_DEV_PAGES=true or in development
 */
export default function TestErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  // Gate this page in production
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_PAGES !== "true" && process.env.NODE_ENV === "production") {
      notFound();
    }
  }, []);

  if (shouldThrow) {
    throw new Error("Test error for support system - This is a simulated error to test the error boundary and support form.");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Test Error Boundary</h1>
          <p className="text-muted-foreground">
            Click the button below to trigger an error and test the support form system.
          </p>
        </div>

        <Button
          onClick={() => setShouldThrow(true)}
          className="w-full"
          variant="destructive"
        >
          Trigger Test Error
        </Button>

        <div className="rounded-md bg-yellow-500/10 border border-yellow-500/20 p-4">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            <strong>Note:</strong> This will trigger the GlobalErrorBoundary and show the Contact Support button.
            You can test the support form without actually sending an email if RESEND_API_KEY is not configured.
          </p>
        </div>
      </div>
    </div>
  );
}
