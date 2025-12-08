// Instrumentation - COMPLETELY DISABLED
// Sentry is temporarily disabled, so no instrumentation needed

export async function register() {
  console.log("[Instrumentation] Sentry disabled - no instrumentation loaded");

  // Sentry imports disabled
  // if (process.env.NEXT_RUNTIME === "nodejs") {
  //   await import("./sentry.server.config");
  // }
  //
  // if (process.env.NEXT_RUNTIME === "edge") {
  //   await import("./sentry.edge.config");
  // }
}
