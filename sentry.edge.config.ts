import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

// Temporarily disable Sentry in production to debug 429 errors
if (ENVIRONMENT === "production") {
  console.log("[Sentry Edge] Disabled in production to prevent 429 errors");
} else {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Set environment (production, staging, development)
    environment: ENVIRONMENT,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Sample rate for errors (100% = all errors are captured)
  sampleRate: 1.0,

  // Filter out certain errors
  beforeSend(event, hint) {
    // Don't send errors in development unless explicitly enabled
    if (ENVIRONMENT === "development" && !process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
      return null;
    }

    return event;
  },

  // Add tags for better filtering
  initialScope: {
    tags: {
      runtime: "edge",
    },
  },
});
}
