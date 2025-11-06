# Sentry Error Tracking Setup

This document provides instructions for setting up and configuring Sentry error tracking for the Macedonian Learning App.

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Free Tier Limitations](#free-tier-limitations)
- [Troubleshooting](#troubleshooting)

## Overview

Sentry is configured to track errors across:
- **Client-side** (Browser/React): Captures client-side JavaScript errors
- **Server-side** (Node.js): Captures API and server-side errors
- **Edge Runtime**: Captures errors in edge functions

### Features Enabled
- Error tracking (100% sample rate)
- Performance monitoring (10% in production, 100% in development)
- Session replay for debugging
- Source maps for readable stack traces
- Automatic React component annotations
- Integration with Prisma database
- Ad-blocker bypass via `/monitoring` tunnel route

## Getting Started

### 1. Create a Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up for a free account
3. Create a new project:
   - Choose **Next.js** as the platform
   - Name your project (e.g., "macedonian-learning-app")
   - Set alert frequency to your preference

### 2. Get Your Sentry DSN

After creating your project:

1. Navigate to **Settings** > **Projects** > **[Your Project]** > **Client Keys (DSN)**
2. Copy the DSN (it looks like: `https://[key]@[organization].ingest.sentry.io/[project-id]`)
3. Add it to your `.env.local` file:

```bash
NEXT_PUBLIC_SENTRY_DSN="https://[key]@[organization].ingest.sentry.io/[project-id]"
```

### 3. Configure Source Maps (For Production)

To get readable stack traces in production, you need to upload source maps:

1. Create an Auth Token:
   - Go to **Settings** > **Account** > **API** > **Auth Tokens**
   - Click **Create New Token**
   - Give it a name (e.g., "CI/CD Source Maps")
   - Select scopes:
     - `project:read`
     - `project:releases`
     - `org:read`
   - Copy the token

2. Add configuration to `.env.local`:

```bash
SENTRY_AUTH_TOKEN="your-auth-token"
SENTRY_ORG="your-organization-slug"
SENTRY_PROJECT="your-project-name"
```

**Important:** Never commit these tokens to Git! They're already in `.gitignore`.

## Configuration

### Configuration Files

The following configuration files have been created:

1. **`sentry.client.config.ts`** - Client-side configuration
   - Captures browser errors
   - Session replay enabled
   - Browser tracing integration
   - Filters out browser extension errors

2. **`sentry.server.config.ts`** - Server-side configuration
   - Captures API and server errors
   - Prisma integration for database errors
   - HTTP integration for request tracing
   - Filters out expected 4xx errors

3. **`sentry.edge.config.ts`** - Edge runtime configuration
   - Captures errors in edge functions
   - Lightweight configuration for edge runtime

4. **`next.config.ts`** - Webpack plugin configuration
   - Source map upload configuration
   - React component annotations
   - Tunnel route for ad-blocker bypass

### Error Boundaries

Error boundaries are set up at multiple levels:

- **`app/global-error.tsx`** - Root-level error boundary
- **`app/error.tsx`** - App-level error boundary with custom UI
- **`components/error/GlobalErrorBoundary.tsx`** - Reusable error UI component

## Environment Variables

### Required Variables

```bash
# Sentry DSN (Required for error tracking)
NEXT_PUBLIC_SENTRY_DSN=""
```

### Optional Variables (Recommended for Production)

```bash
# Source Maps Configuration
SENTRY_AUTH_TOKEN=""        # Auth token for uploading source maps
SENTRY_ORG=""              # Your Sentry organization slug
SENTRY_PROJECT=""          # Your Sentry project name

# Development
NEXT_PUBLIC_SENTRY_ENABLED="true"  # Enable Sentry in development
```

### Environment-Specific Behavior

| Environment | Error Tracking | Performance Tracking | Session Replay |
|-------------|---------------|---------------------|----------------|
| Development | Disabled by default (opt-in via `NEXT_PUBLIC_SENTRY_ENABLED`) | 100% | Disabled |
| Production  | 100% | 10% | 10% |

## Testing

### Test Error Tracking

#### 1. Test Client-Side Errors

Create a test page or button that throws an error:

```tsx
// Test in your browser console
throw new Error("Test Sentry Client Error");
```

Or add a test button to any page:

```tsx
<button onClick={() => {
  throw new Error("Test Sentry Client Error");
}}>
  Test Error
</button>
```

#### 2. Test Server-Side Errors

Add a test API route at `app/api/test-sentry/route.ts`:

```typescript
export async function GET() {
  throw new Error("Test Sentry Server Error");
}
```

Then visit: `http://localhost:3000/api/test-sentry`

#### 3. Verify in Sentry Dashboard

1. Go to your Sentry dashboard
2. Navigate to **Issues**
3. You should see your test errors appear within a few seconds
4. Click on an error to see:
   - Stack trace
   - Breadcrumbs (user actions leading to error)
   - Device/browser information
   - Source code context

### Test in Development

By default, Sentry is **disabled in development** to avoid noise. To enable it:

```bash
# Add to .env.local
NEXT_PUBLIC_SENTRY_ENABLED="true"
```

Then restart your development server:

```bash
npm run dev
```

## Production Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard:
   - Go to **Project Settings** > **Environment Variables**
   - Add the following for **Production** environment:
     ```
     NEXT_PUBLIC_SENTRY_DSN=<your-dsn>
     SENTRY_AUTH_TOKEN=<your-auth-token>
     SENTRY_ORG=<your-org>
     SENTRY_PROJECT=<your-project>
     ```

2. Redeploy your application

3. Verify source maps are uploaded:
   - Check build logs for "Sentry: Source maps uploaded successfully"
   - Or check Sentry dashboard: **Settings** > **Projects** > **Source Maps**

### Other Platforms

For other deployment platforms:

1. Set environment variables in your platform's configuration
2. Ensure build process has access to `SENTRY_AUTH_TOKEN`
3. Verify source maps are uploaded during build

### Build Configuration

The build process will:
- Automatically upload source maps to Sentry
- Strip source maps from client bundles (for security)
- Tree-shake Sentry logger statements
- Annotate React components for better debugging

## Free Tier Limitations

Sentry's free tier includes:

### Included in Free Tier
- **5,000 errors per month**
- **10,000 performance units per month**
- **1 project**
- **1 team member**
- **30 days data retention**
- Unlimited source maps
- Session replay (with limits)

### Recommendations
- Our configuration samples 10% of traces in production (adjustable)
- 100% of errors are captured (important!)
- Session replay at 10% to stay within limits
- Filters common errors (browser extensions, network issues)

### If You Exceed Limits

If you start hitting limits:

1. **Adjust sample rates** in config files:
   ```typescript
   // Reduce from 0.1 (10%) to 0.05 (5%)
   tracesSampleRate: 0.05
   ```

2. **Add more error filters** in `beforeSend` hooks

3. **Upgrade to paid plan** if needed ($26/month for Team plan)

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN is set correctly:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify Sentry is initialized:**
   - Open browser console
   - Look for Sentry initialization messages
   - Check Network tab for requests to Sentry

3. **Check environment:**
   - In development, set `NEXT_PUBLIC_SENTRY_ENABLED="true"`
   - Restart dev server after adding env vars

4. **Verify config files are loaded:**
   - Add `debug: true` to config files temporarily
   - Check console for Sentry debug logs

### Source Maps Not Working

1. **Verify auth token has correct permissions:**
   - `project:releases`
   - `project:read`
   - `org:read`

2. **Check build logs:**
   ```bash
   npm run build
   ```
   Look for "Sentry: Source maps uploaded successfully"

3. **Verify environment variables are set:**
   ```bash
   echo $SENTRY_AUTH_TOKEN
   echo $SENTRY_ORG
   echo $SENTRY_PROJECT
   ```

4. **Check Sentry dashboard:**
   - Go to **Settings** > **Projects** > **Source Maps**
   - Verify maps for your release version

### High Volume of Errors

1. **Review ignored errors list** in config files
2. **Add more filters** in `beforeSend` hooks
3. **Reduce sample rates** temporarily
4. **Fix underlying issues** causing errors

### Performance Issues

Sentry should have minimal performance impact:
- Client bundle increases by ~50KB (gzipped)
- Source map upload adds ~30 seconds to build time
- Runtime overhead is negligible with our sample rates

If you notice issues:
1. Reduce `tracesSampleRate`
2. Disable session replay in production
3. Add more URL filters to ignore certain routes

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)

## Support

For issues with this setup:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Sentry documentation
3. Open an issue in the project repository
4. Contact the development team

---

**Last Updated:** 2025-11-06
