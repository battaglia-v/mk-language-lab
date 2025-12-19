"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
<<<<<<< HEAD
import { PageContainer } from "@/components/layout";
=======
import { notFound } from "next/navigation";
>>>>>>> 51574487d50fe7ce96844f34da58f328c24ac6c0

/**
 * Test page for Sentry client-side error tracking
 *
 * This page provides buttons to test different types of errors and events.
 * Navigate to /test-sentry to use it.
 *
 * GATED: Only available when NEXT_PUBLIC_ENABLE_DEV_PAGES=true
 */
export default function TestSentryPage() {
  // Gate this page in production
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_PAGES !== "true" && process.env.NODE_ENV === "production") {
      notFound();
    }
  }, []);
  const [result, setResult] = useState<string>("");
  const common = useTranslations("common");

  const testClientError = () => {
    try {
      throw new Error("Test Sentry Client Error");
    } catch {
      setResult("Error thrown! Check Sentry dashboard.");
    }
  };

  const testHandledError = () => {
    try {
      throw new Error("Test Sentry Handled Client Error");
    } catch (error) {
      Sentry.captureException(error);
      setResult("Handled error captured! Check Sentry dashboard.");
    }
  };

  const testMessage = () => {
    Sentry.captureMessage("Test Sentry Client Message", "info");
    setResult("Message sent! Check Sentry dashboard.");
  };

  const testServerError = async () => {
    try {
      const response = await fetch("/api/test-sentry");
      const data = await response.json();
      setResult(`Server error triggered: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const testServerHandledError = async () => {
    try {
      const response = await fetch("/api/test-sentry?type=handled");
      const data = await response.json();
      setResult(`Server handled error: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  const testServerMessage = async () => {
    try {
      const response = await fetch("/api/test-sentry?type=message");
      const data = await response.json();
      setResult(`Server message: ${JSON.stringify(data)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <PageContainer size="lg" className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Sentry Test Page</h1>
          <p className="text-muted-foreground">
            Use the buttons below to test different types of errors and events.
            Check your Sentry dashboard to verify they appear.
          </p>
          <div className="rounded-lg border border-yellow-500 bg-yellow-500/10 p-4">
            <p className="font-semibold text-yellow-500">
              Warning: This page is for testing only and should be removed or protected in production.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Client-Side Tests</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={testClientError}
                className="rounded-md border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-accent"
              >
                Throw Error
              </button>
              <button
                onClick={testHandledError}
                className="rounded-md border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-accent"
              >
                Capture Error
              </button>
              <button
                onClick={testMessage}
                className="rounded-md border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-accent"
              >
                Send Message
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Server-Side Tests</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={testServerError}
                className="rounded-md border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-accent"
              >
                Server Error
              </button>
              <button
                onClick={testServerHandledError}
                className="rounded-md border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-accent"
              >
                Server Handled Error
              </button>
              <button
                onClick={testServerMessage}
                className="rounded-md border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-accent"
              >
                Server Message
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-2 font-semibold">Result:</h3>
            <p className="font-mono text-sm">{result}</p>
          </div>
        )}

        <div className="space-y-3 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Instructions</h2>
          <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
            <li>Ensure NEXT_PUBLIC_SENTRY_DSN is set in your .env.local file</li>
            <li>In development, set NEXT_PUBLIC_SENTRY_ENABLED=&quot;true&quot; to enable Sentry</li>
            <li>Click any button above to trigger a test</li>
            <li>Go to your Sentry dashboard at https://sentry.io</li>
            <li>Navigate to Issues to see the captured errors/messages</li>
            <li>Click on an issue to see details, stack traces, and breadcrumbs</li>
          </ol>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block rounded-md border border-border bg-background px-6 py-2 font-medium transition-colors hover:bg-accent"
          >
            {common("goHome")}
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
