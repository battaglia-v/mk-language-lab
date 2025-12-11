# Sentry Quick Start Guide

Quick reference for setting up Sentry error tracking in the Macedonian Learning App.

## 1. Get Sentry Credentials (5 minutes)

1. **Sign up:** [https://sentry.io/signup/](https://sentry.io/signup/)
2. **Create project:** Choose "Next.js" platform
3. **Get DSN:** Settings > Projects > [Project] > Client Keys (DSN)
4. **Get Auth Token:** Settings > Account > API > Auth Tokens
   - Scopes needed: `project:read`, `project:releases`, `org:read`

## 2. Configure Environment Variables

Add to `.env.local`:

```bash
# Required - For error tracking
NEXT_PUBLIC_SENTRY_DSN="https://[key]@[org].ingest.sentry.io/[project-id]"

# Optional - Enable in development
NEXT_PUBLIC_SENTRY_ENABLED="true"

# Required for production - For source maps
SENTRY_AUTH_TOKEN="your-auth-token"
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-project-name"
```

## 3. Test the Setup

### Development Testing

```bash
# Enable Sentry in dev
export NEXT_PUBLIC_SENTRY_ENABLED="true"

# Start dev server
npm run dev

# Visit test page
open http://localhost:3000/test-sentry
```

Click the test buttons and verify errors appear in your Sentry dashboard.

### Production Testing

After deploying:
1. Visit any page that might have an error
2. Check Sentry dashboard for captured errors
3. Verify source maps are working (readable stack traces)

## 4. Verify Installation

Check your Sentry dashboard at [https://sentry.io](https://sentry.io):
- Navigate to **Issues**
- You should see test errors appear within seconds
- Click an error to see stack traces and context

## Configuration Summary

| File | Purpose |
|------|---------|
| `sentry.client.config.ts` | Browser error tracking |
| `sentry.server.config.ts` | Server-side error tracking |
| `sentry.edge.config.ts` | Edge runtime error tracking |
| `instrumentation.ts` | Next.js initialization hook |
| `next.config.ts` | Source map upload configuration |
| `app/error.tsx` | Error boundary with custom UI |
| `app/global-error.tsx` | Root-level error handler |

## Sample Rates

| Metric | Development | Production |
|--------|-------------|------------|
| Errors | 100% | 100% |
| Performance Traces | 100% | 10% |
| Session Replay | 0% | 10% |

## Production Deployment

### Vercel

Add these environment variables in **Project Settings > Environment Variables**:

```
NEXT_PUBLIC_SENTRY_DSN=<your-dsn>
SENTRY_AUTH_TOKEN=<your-token>
SENTRY_ORG=<your-org>
SENTRY_PROJECT=<your-project>
```

Deploy and verify source maps upload in build logs.

### Other Platforms

Ensure build environment has access to all Sentry environment variables, especially `SENTRY_AUTH_TOKEN` for source map uploads.

## Free Tier Limits

- **5,000 errors/month** (plenty for most apps)
- **10,000 performance units/month**
- **30 days data retention**
- **1 project, 1 team member**

With our 10% sampling rates, you're unlikely to hit these limits.

## Troubleshooting

### Errors not appearing?

```bash
# Check DSN is set
echo $NEXT_PUBLIC_SENTRY_DSN

# Enable Sentry in dev
echo 'NEXT_PUBLIC_SENTRY_ENABLED="true"' >> .env.local

# Restart server
npm run dev
```

### Source maps not working?

```bash
# Check all vars are set
echo $SENTRY_AUTH_TOKEN
echo $SENTRY_ORG
echo $SENTRY_PROJECT

# Check build logs
npm run build | grep -i sentry
```

## Test Endpoints

- **Test Page:** `/test-sentry`
- **API Test:** `/api/test-sentry`
  - `?type=handled` - Handled error
  - `?type=message` - Test message

**Important:** Remove or protect these endpoints in production!

## Need More Help?

See the complete guide: [SENTRY_SETUP.md](SENTRY_SETUP.md)

---

**Setup Time:** ~10 minutes
**Status:** ✅ Fully Configured
