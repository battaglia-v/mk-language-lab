# External Integrations

**Analysis Date:** 2026-01-06

## APIs & External Services

**AI & Language Services:**
- OpenAI API - AI tutoring feature - `app/api/tutor/route.ts`
  - SDK/Client: openai npm package v6.7
  - Auth: `OPENAI_API_KEY` env var
  - Rate limited: 15 requests/minute per IP

- Google Cloud Translation API (v2) - Text translation - `app/api/translate/route.ts`
  - SDK/Client: @google-cloud/translate v9.2.1
  - Auth: `GOOGLE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`

- Google Cloud Text-to-Speech API - Audio generation - `app/api/tts/route.ts`
  - SDK/Client: @google-cloud/text-to-speech v6.4.0
  - Auth: Same Google Cloud credentials
  - Supports: Macedonian (via Serbian sr-RS voice), English

**Email/SMS:**
- Resend - Transactional emails - `lib/email.ts`
  - SDK/Client: resend v6.5.2
  - Auth: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

**Social Media:**
- Instagram Graph API (v18.0) - Feed integration - `app/api/instagram/posts/route.ts`
  - Auth: `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`

## Data Storage

**Databases:**
- PostgreSQL (Neon pooler compatible) - Primary data store
  - Connection: `DATABASE_URL`, `DIRECT_URL` env vars
  - Client: Prisma ORM v6.19 - `lib/prisma.ts`
  - Migrations: `prisma/migrations/` (18+ migrations)

**File Storage:**
- AWS S3 (S3-compatible, including Cloudflare R2) - Image storage - `lib/image-storage.ts`
  - SDK/Client: @aws-sdk/client-s3 v3.931.0
  - Auth: `IMAGE_STORAGE_ACCESS_KEY`, `IMAGE_STORAGE_SECRET_KEY`
  - Config: `IMAGE_STORAGE_BUCKET`, `IMAGE_STORAGE_ENDPOINT`, `IMAGE_STORAGE_CDN_URL`

**Caching:**
- Upstash Redis - Rate limiting - `lib/rate-limit.ts`
  - Connection: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Endpoints rate limited: translate, news, word-of-day, support, tutor, auth

## Authentication & Identity

**Auth Provider:**
- NextAuth v5 (beta) - Multi-provider auth - `lib/auth.ts`
  - Implementation: NextAuth with Prisma adapter
  - Token storage: Server-side sessions
  - Session management: JWT-based

**OAuth Integrations:**
- Google OAuth - Social sign-in - `lib/auth.ts`
  - Credentials: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- Facebook OAuth - Social sign-in - `lib/auth.ts`
  - Credentials: `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`
- Credentials provider - Email/password login
  - Password hashing: bcryptjs v3.0.3

## Monitoring & Observability

**Error Tracking:**
- Sentry - Server, client, and edge errors - `sentry.*.config.ts`
  - DSN: `NEXT_PUBLIC_SENTRY_DSN`
  - Auth: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
  - Release tracking via Git commit SHA

**Analytics:**
- Vercel Analytics - Privacy-friendly usage tracking - `lib/analytics.ts`
  - GDPR compliant, no cookies, no PII tracking

**Logs:**
- Vercel logs - stdout/stderr via console.log/error
- Structured logging in API routes

## CI/CD & Deployment

**Hosting:**
- Vercel - Next.js serverless hosting
  - Deployment: Automatic on main branch push
  - Environment vars: Configured in Vercel dashboard

**CI Pipeline:**
- GitHub Actions - Tests and type checking
  - Workflows: `.github/workflows/`
  - Pre-commit: lint-staged, type-check, unit tests

## Environment Configuration

**Development:**
- Required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Secrets location: `.env.local` (gitignored)
- Template: `.env.example`
- Mock services: Can run without external APIs (graceful degradation)

**Production:**
- Secrets management: Vercel environment variables
- Database: Neon PostgreSQL with connection pooling
- CDN: Configured for image proxying and static assets

## Webhooks & Callbacks

**Incoming:**
- Instagram webhook validation - `/api/instagram/webhook`
- Cron endpoints - `/api/cron/*` (secured with `CRON_SECRET`)

**Mobile Push Notifications:**
- Expo Push Notifications - `lib/expo-push.ts`
  - Endpoint: `https://exp.host/--/api/v2/push/send`
  - Supports multiple platform tokens per user

**Payments (Future - Not Yet Live):**
- Stripe - Web payments (stubbed) - `lib/billing/stripe.ts`
  - Feature flag: `ENABLE_WEB_PAYMENTS = false`
  - Requires: Stripe account, webhook setup, end-to-end testing

- Google Play Billing - Mobile in-app purchases - `lib/billing/google-play.ts`
  - For mobile app integration

---

*Integration audit: 2026-01-06*
*Update when adding/removing external services*
