import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

Sentry.init({
  dsn: SENTRY_DSN,

  // Set environment (production, staging, development)
  environment: ENVIRONMENT,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Sample rate for errors (100% = all errors are captured)
  sampleRate: 1.0,

  // Server-specific integrations
  integrations: [
    Sentry.prismaIntegration(),
    Sentry.httpIntegration(),
  ],

  // Filter out certain errors
  beforeSend(event, hint) {
    // Don't send errors in development unless explicitly enabled
    if (ENVIRONMENT === "development" && !process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
      return null;
    }

    // Don't log expected errors that are handled
    const error = hint.originalException;
    if (error && typeof error === "object" && "statusCode" in error) {
      const statusCode = Number(error.statusCode);
      // Don't log 4xx client errors (except 429 rate limit)
      if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        return null;
      }
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Common Node.js errors that are expected
    "ECONNRESET",
    "EPIPE",
    "ETIMEDOUT",
    // Database errors that are handled
    "P2002", // Prisma unique constraint violation
    "P2025", // Prisma record not found
  ],

  // Add tags for better filtering
  initialScope: {
    tags: {
      runtime: "node",
    },
  },
});
