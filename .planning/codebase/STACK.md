# Technology Stack

**Analysis Date:** 2026-01-06

## Languages

**Primary:**
- TypeScript 5 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- JavaScript (ESM) - Configuration files (`.mjs` extensions)
- JSX/TSX - React components

## Runtime

**Environment:**
- Node.js (serverless-optimized via Vercel) - `next.config.ts`
- Browser/Client-side React execution

**Package Manager:**
- npm with workspaces for monorepo structure - `package.json`
- Lockfile: `package-lock.json`

## Frameworks

**Core:**
- Next.js 16.0.10 - Full-stack framework - `package.json`, `next.config.ts`
- React 19.2.0 - UI framework - `package.json`

**Internationalization:**
- next-intl 4.5.7 - i18n support for English (en) and Macedonian (mk) - `i18n.ts`
- Messages: `messages/en.json`, `messages/mk.json`

**Styling:**
- Tailwind CSS 4 - Utility-first CSS - `package.json`, `postcss.config.mjs`
- Tamagui 1.138.6 - Cross-platform UI components - `package.json`
- Radix UI - Accessible component primitives - `package.json`
- Framer Motion 12.23.25 - Animations - `package.json`

**Testing:**
- Vitest 4.0.0 - Unit testing - `vitest.config.ts`
- Playwright 1.56.1 - E2E testing - `playwright.config.ts`
- @testing-library/react 16.3.0 - React component testing - `package.json`
- msw 2.11.5 - API mocking - `package.json`

**Build/Dev:**
- Turbopack (experimental) - Fast bundling via `npm run dev --turbopack`
- TypeScript 5 - Compilation and type checking - `tsconfig.json`
- ESLint 9.0.0 - Linting - `eslint.config.mjs`
- Prettier - Code formatting - `package.json` scripts

## Key Dependencies

**Critical:**
- Prisma 6.19.0 - ORM for PostgreSQL - `lib/prisma.ts`, `prisma/schema.prisma`
- NextAuth 5.0.0-beta.30 - Authentication - `lib/auth.ts`
- openai 6.7.0 - AI tutoring features - `app/api/tutor/route.ts`
- @google-cloud/translate 9.2.1 - Translation API - `app/api/translate/route.ts`
- @google-cloud/text-to-speech 6.4.0 - TTS service - `app/api/tts/route.ts`

**Infrastructure:**
- @upstash/ratelimit - Rate limiting - `lib/rate-limit.ts`
- @aws-sdk/client-s3 3.931.0 - Image storage - `lib/image-storage.ts`
- @sentry/nextjs 10.23.0 - Error tracking - `sentry.*.config.ts`
- @vercel/analytics 1.5.0 - Analytics - `lib/analytics.ts`
- resend 6.5.2 - Email delivery - `lib/email.ts`

**Data & State:**
- @tanstack/react-query 5.62.0 - Server state management - `package.json`
- swr 2.3.6 - Data fetching with stale-while-revalidate - `package.json`
- zod 4.1.12 - Schema validation - `package.json`

**Monorepo Packages:**
- `@mk/tokens` - Design tokens - `packages/tokens/`
- `@mk/ui` - Shared UI components - `packages/ui/`
- `@mk/api-client` - Typed API client - `packages/api-client/`
- `@mk/practice` - Practice logic - `packages/practice/`
- `@mk/gamification` - Gamification logic - `packages/gamification/`
- `@mk/analytics` - Analytics events - `packages/analytics/`

## Configuration

**Environment:**
- `.env` files for secrets and configuration - `.env.example` template
- Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`
- Optional: Google Cloud, OpenAI, Upstash, Sentry, Instagram, Resend, Expo keys

**Build:**
- `next.config.ts` - Next.js with Sentry, PWA, i18n, image optimization
- `tsconfig.json` - Strict TypeScript, path aliases (`@/`, `@mk/*`)
- `vitest.config.ts` - Unit test runner
- `playwright.config.ts` - E2E test runner with mobile viewports

## Platform Requirements

**Development:**
- Any platform with Node.js
- PostgreSQL database (or Neon pooler)
- Optional: Redis for rate limiting (Upstash)

**Production:**
- Vercel - Serverless hosting
- Neon PostgreSQL - Database with connection pooling
- Upstash Redis - Rate limiting
- Sentry - Error monitoring
- Vercel Analytics - Usage analytics

---

*Stack analysis: 2026-01-06*
*Update after major dependency changes*
