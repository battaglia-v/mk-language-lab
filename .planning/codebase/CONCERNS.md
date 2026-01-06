# Codebase Concerns

**Analysis Date:** 2026-01-06

## Tech Debt

**Incomplete Stripe Web Payments Integration:**
- Files: `lib/billing/stripe.ts` (lines 7, 47, 54-55, 72, 89, 113, 121, 133, 140, 158, 179, 185, 204, 211)
- Issue: Stubbed but disabled via feature flag (`ENABLE_WEB_PAYMENTS = false`)
- Why: Rapid prototyping for mobile-first, web payments planned for later
- Impact: Cannot accept web payments; webhook verification not implemented
- Fix approach: Complete Stripe integration: account setup, price IDs, checkout sessions, webhook verification

**Duplicate Google Cloud Credential Parsing:**
- Files: `app/api/translate/route.ts` (lines 16-29), `app/api/cron/sync-content/route.ts` (lines 9-22)
- Issue: Identical credential parsing logic duplicated in two files
- Why: Each endpoint was developed independently
- Impact: If parsing logic needs updating, must find and update both files
- Fix approach: Extract to shared utility in `lib/google-credentials.ts`

**Non-Singleton Prisma Client Instances:**
- Files: `app/api/lessons/progress/route.ts` (line 6), `app/api/cron/sync-content/route.ts` (line 6)
- Issue: Creates new `PrismaClient()` instead of using singleton from `lib/prisma.ts`
- Why: Likely copy-paste error during development
- Impact: Defeats connection pooling, can cause connection exhaustion in serverless
- Fix approach: Replace `new PrismaClient()` with `import prisma from '@/lib/prisma'`

## Known Bugs

**None identified as blocking:**
- Codebase appears stable based on analysis
- Most issues are tech debt rather than bugs

## Security Considerations

**Rate Limiting Fallback:**
- File: `lib/rate-limit.ts` (lines 77-80)
- Risk: When Redis unavailable, rate limiting returns `success: true` for all requests
- Current mitigation: Only affects development without Redis configured
- Recommendations: Log warning when rate limiter is disabled; consider stricter fallback in production

**Missing Input Validation:**
- Files: `app/api/lessons/progress/route.ts`, `app/api/missions/setup/route.ts`, `app/api/quests/progress/route.ts`
- Risk: Request body accessed without Zod schema validation
- Current mitigation: TypeScript catches some issues at compile time
- Recommendations: Add Zod validation schemas to all POST/PUT handlers

## Performance Bottlenecks

**N+1 Query in Admin Users Endpoint:**
- File: `app/api/admin/users/route.ts` (lines 79-97)
- Problem: Fetches users, then makes separate `gameProgress.findUnique()` per user
- Measurement: ~20 extra queries per page load for 20-user pagination
- Cause: Sequential queries inside `Promise.all()` map
- Improvement path: Include `gameProgress` in initial query, or use batch `findMany`

**Sequential Database Operations in Cron:**
- File: `app/api/cron/sync-content/route.ts` (lines 205-248)
- Problem: Creates vocabulary items in sequential loop
- Measurement: Completion time grows linearly with content size
- Cause: Individual `prisma.create()` calls inside for loop
- Improvement path: Use `createMany()` for batch operations

## Fragile Areas

**Hardcoded Timeout Values:**
- Files: `app/api/translate/route.ts` (15s), `app/api/image-proxy/route.ts` (12s), `app/api/news/route.ts` (6s)
- Why fragile: Cannot adjust timeouts per environment without code changes
- Common failures: Timeout errors in slow network conditions
- Safe modification: Extract to environment variables with sensible defaults
- Test coverage: Not specifically tested

**Image Proxy Allowlist:**
- File: `app/api/image-proxy/route.ts` (lines 22-80)
- Why fragile: 60+ hardcoded Macedonian news domains
- Common failures: New domains not proxied, broken images
- Safe modification: Periodically review and update domain list
- Test coverage: No automated verification of domain validity

## Scaling Limits

**Vercel Serverless:**
- Current capacity: Standard Vercel limits (10s function timeout on free, 60s on Pro)
- Limit: Heavy cron jobs may timeout
- Symptoms at limit: 504 gateway timeouts on long operations
- Scaling path: Optimize cron jobs, consider background job service for heavy processing

**Database Connections:**
- Current capacity: Neon PostgreSQL pooler handles connection pooling
- Limit: Prisma singleton pattern assumes proper pooling
- Symptoms at limit: Connection errors if non-singleton clients used
- Scaling path: Ensure all code uses singleton; monitor connection count

## Dependencies at Risk

**NextAuth Beta:**
- Package: next-auth@5.0.0-beta.30
- Risk: Beta version may have breaking changes before stable release
- Impact: Authentication could require migration work
- Migration plan: Monitor NextAuth releases, plan upgrade when stable

## Missing Critical Features

**Incomplete TODO Items:**
- `app/api/leaderboard/route.ts`: weeklyXP tracking and friendship system not implemented
- `components/reader/ReaderQuizButton.tsx`: Results not saved to user progress
- `lib/lesson-runner/adapters/exercise-adapter.ts`: Custom exercise types need implementation
- `lib/in-app-review.ts`: Google Play In-App Review API integration missing
- `components/monetization/UpgradeModal.tsx`: Web payment and restore functionality incomplete

## Test Coverage Gaps

**Untested Critical Paths:**
- What's not tested: Auth endpoints (`app/api/auth/*`), admin endpoints, mobile auth, cron jobs
- Risk: Authentication and data migration code could break silently
- Priority: High for auth, medium for admin
- Difficulty to test: Need session mocking, webhook simulation

**Missing E2E Coverage:**
- What's not tested: Full payment flow (not implemented yet)
- Risk: When payments are enabled, no automated verification
- Priority: High before enabling web payments
- Difficulty to test: Requires Stripe test fixtures and webhook simulation

---

*Concerns audit: 2026-01-06*
*Update as issues are fixed or new ones discovered*
