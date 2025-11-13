# System Architecture

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Quarterly

Македонски • MK Language Lab is a Next.js 15 application that serves localized learning experiences backed by Prisma content storage and external API integrations. The app runs primarily on the Vercel Edge runtime, with selective Node.js functions for third-party SDKs.

## High-Level Diagram

```mermaid
graph TD
  A[Browser Client] -->|locale-specific request| B[Next.js App Router]
  B -->|SSR/SSG| C[TranslationProvider]
  B -->|Data loaders| D[data/*.ts modules]
  B -->|Prisma queries| E[(Database)]
  B -->|API route call| F[/app/api/news]
  B -->|API route call| G[/app/api/translate]
  B -->|API route call| H[/app/api/tutor]
  G -->|Google Cloud Translate| I[(External Service)]
  H -->|OpenAI Chat Completion| J[(External Service)]
  F -->|RSS feeds| K[(Time.mk, Meta.mk)]
```

## Runtime Overview

- **UI Shell**: `app/layout.tsx` sets global providers, with locale-aware routing under `app/[locale]/`.
- **Localization**: `lib/translation-provider.ts` resolves the correct message bundle from `messages/*.json` and exposes translation hooks to client components.
- **Content Modules**: Static learning content lives in `data/` (e.g., `journeys.ts`, `journey-practice-content.ts`) and is imported directly into server components for deterministic rendering.
- **Persistence**: Prisma client (`lib/prisma.ts`) connects to the backing database for user boards, tutor sessions (future), and other dynamic entities defined in `prisma/schema.prisma`.
- **API Routes**:
  - `/api/news` aggregates Macedonian RSS feeds, normalizes media, and caches previews in-memory.
  - `/api/translate` and `/api/translate/detect` provide translation utilities with Google Cloud fallbacks.
  - `/api/tasks` persists kanban boards for authenticated users.
  - `/api/tutor` proxies tutor chat requests to OpenAI, injecting journey context.

## Key Decisions

- **App Router**: All learner experiences live under locale-prefixed routes to keep translations scoped and to enable static generation where possible.
- **Edge vs Node Runtime**: API routes that rely on Node-only dependencies (e.g., Google SDK, OpenAI) run in the Node.js runtime; static pages favor edge-ready rendering for low latency.
- **Fallback Strategies**: Translation and news feeds include mock responses when third-party credentials are absent, ensuring the UI remains functional in development.
- **Caching**: `/api/news` applies in-memory caches for link resolution and preview enrichment with a configurable TTL to minimize feed scraping overhead.

## Observability Hooks

- Console logging in API routes surfaces credential misconfiguration during development (`translation` and `tutor` endpoints).
- TODO: integrate centralized logging and metrics via Vercel logging or Logflare to monitor external API latency.

## Next Steps

- Add deployment diagram covering Vercel environments and Prisma database connectivity.
- Document data retention and privacy considerations for tutor chat once persistence lands.
