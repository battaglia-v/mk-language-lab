import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || "development";

Sentry.init({
  dsn: SENTRY_DSN,

  // Set environment (production, staging, development)
  environment: ENVIRONMENT,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: ENVIRONMENT === "production" ? 0.05 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Sample rate for errors - reduce in production to avoid rate limiting
  sampleRate: ENVIRONMENT === "production" ? 0.5 : 1.0,

  // Reduce replay capture to avoid 429 rate limit errors
  replaysOnErrorSampleRate: ENVIRONMENT === "production" ? 0.1 : 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: ENVIRONMENT === "production" ? 0.05 : 0.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out certain errors
  beforeSend(event, hint) {
    // Don't send errors in development unless explicitly enabled
    if (ENVIRONMENT === "development" && !process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
      return null;
    }

    // Filter out known third-party errors
    const error = hint.originalException;
    if (error && typeof error === "object" && "message" in error) {
      const message = String(error.message);

      // Filter out common browser extension errors
      if (
        message.includes("chrome-extension://") ||
        message.includes("moz-extension://") ||
        message.includes("safari-extension://")
      ) {
        return null;
      }

      // Filter out network errors that are outside our control
      if (
        message.includes("Failed to fetch") ||
        message.includes("NetworkError") ||
        message.includes("Network request failed") ||
        message.includes("429") ||
        message.includes("Too Many Requests")
      ) {
        return null;
      }
    }

    // Filter out Sentry's own rate limit errors
    if (event.request?.url?.includes("sentry.io")) {
      return null;
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.epicplay.com",
    "Can't find variable: ZiteReader",
    "jigsaw is not defined",
    "ComboSearch is not defined",
    "atomicFindClose",
    "fb_xd_fragment",
    "bmi_SafeAddOnload",
    "EBCallBackMessageReceived",
    "conduitPage",
    // Network errors
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    "429",
    "Too Many Requests",
    "Failed to fetch",
    "NetworkError",
    "Network request failed",
  ],

  // Don't capture console logs
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "console") {
      return null;
    }
    return breadcrumb;
  },
});
