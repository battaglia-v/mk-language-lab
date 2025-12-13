import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
// import { withSentryConfig } from "@sentry/nextjs"; // Disabled - Sentry temporarily removed
import withPWA from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Enable gzip compression for API routes when not using Vercel Edge
  compress: true,
  images: {
    unoptimized: false,
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
      // Macedonian news source domains (time.mk aggregates from these)
      {
        protocol: 'https',
        hostname: '360stepeni.mk',
      },
      {
        protocol: 'https',
        hostname: '**.360stepeni.mk',
      },
      {
        protocol: 'https',
        hostname: 'zurnal.mk',
      },
      {
        protocol: 'https',
        hostname: '**.zurnal.mk',
      },
      {
        protocol: 'https',
        hostname: 'libertas.mk',
      },
      {
        protocol: 'https',
        hostname: '**.libertas.mk',
      },
      {
        protocol: 'https',
        hostname: 'novamakedonija.com.mk',
      },
      {
        protocol: 'https',
        hostname: '**.novamakedonija.com.mk',
      },
      {
        protocol: 'https',
        hostname: 'sportstation.mk',
      },
      {
        protocol: 'https',
        hostname: '**.sportstation.mk',
      },
      {
        protocol: 'https',
        hostname: 'plusinfo.mk',
      },
      {
        protocol: 'https',
        hostname: '**.plusinfo.mk',
      },
      {
        protocol: 'https',
        hostname: 'trn.mk',
      },
      {
        protocol: 'https',
        hostname: '**.trn.mk',
      },
      {
        protocol: 'https',
        hostname: 'ekonomskivestnik.com.mk',
      },
      {
        protocol: 'https',
        hostname: '**.ekonomskivestnik.com.mk',
      },
      {
        protocol: 'https',
        hostname: 'vistinomer.mk',
      },
      {
        protocol: 'https',
        hostname: '**.vistinomer.mk',
      },
      // Additional common Macedonian news and CDN domains
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: '**.wordpress.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      // Catch-all for .mk domains
      {
        protocol: 'https',
        hostname: '**.mk',
      },
      {
        protocol: 'http',
        hostname: '**.mk',
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
    // Enable system TLS certificates so Turbopack can download Google Fonts
    // assets (Vercel's build environment does not allow outbound TLS without
    // explicitly opting in, which caused deployments to fail).
    turbopackUseSystemTlsCerts: true,
  },
  // Add security and performance headers
  async headers() {
    return [
      {
        // API routes - add cache hints and security headers
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        // Static assets - enable long-term caching
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Digital Asset Links for Android TWA verification
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
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
  register: false,
});

// Wrap the config with PWA and next-intl (Sentry temporarily disabled)
export default withNextIntl(pwaConfig(nextConfig));
