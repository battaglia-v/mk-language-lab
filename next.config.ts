import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from "@sentry/nextjs";
import withPWA from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // News feed image sources
      {
        protocol: 'https',
        hostname: 'time.mk',
      },
      {
        protocol: 'https',
        hostname: '**.time.mk',
      },
      {
        protocol: 'https',
        hostname: 'meta.mk',
      },
      {
        protocol: 'https',
        hostname: '**.meta.mk',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress all Sentry plugin logs and warnings
  silent: true,

  // Disable source map upload and release creation if no auth token
  // This prevents warnings during build when SENTRY_AUTH_TOKEN is not set
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Disable telemetry to prevent warnings
  telemetry: false,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Tunnel route disabled - sending directly to Sentry
  // tunnelRoute is commented out to avoid 405 errors

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// PWA configuration
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: '/offline',
  },
});

// Wrap the config with PWA, next-intl, and Sentry
export default withSentryConfig(withNextIntl(pwaConfig(nextConfig)), sentryWebpackPluginOptions);
