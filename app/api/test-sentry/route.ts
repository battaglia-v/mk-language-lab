import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

/**
 * Test endpoint for Sentry server-side error tracking
 *
 * Usage:
 * - GET /api/test-sentry - Throws a test error
 * - GET /api/test-sentry?type=handled - Captures a handled error
 * - GET /api/test-sentry?type=message - Sends a test message
 *
 * Note: This endpoint should be removed or protected in production
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  // Only allow in development or if explicitly enabled
  if (process.env.NODE_ENV === "production" && !process.env.SENTRY_TEST_ENABLED) {
    return NextResponse.json(
      { error: "Test endpoint disabled in production" },
      { status: 403 }
    );
  }

  try {
    switch (type) {
      case "handled":
        // Test handled error
        try {
          throw new Error("Test Sentry Handled Server Error");
        } catch (error) {
          Sentry.captureException(error);
          return NextResponse.json({
            message: "Handled error captured and sent to Sentry",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }

      case "message":
        // Test message
        Sentry.captureMessage("Test Sentry Server Message", "info");
        return NextResponse.json({
          message: "Test message sent to Sentry",
        });

      default:
        // Test unhandled error (will be caught by Sentry automatically)
        throw new Error("Test Sentry Unhandled Server Error");
    }
  } catch (error) {
    // This will be caught by Sentry's error handler
    throw error;
  }
}
