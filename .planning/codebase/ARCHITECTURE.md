# Architecture

**Analysis Date:** 2026-01-06

## Pattern Overview

**Overall:** Monolithic Full-Stack Application with Modular Package Architecture

**Key Characteristics:**
- Next.js 16 App Router monolith with monorepo structure (npm workspaces)
- TypeScript-first development throughout
- Server components with selective client-side hydration
- Feature-based page structure with locale routing
- REST API routes following Next.js App Router conventions

## Layers

**Presentation Layer:**
- Purpose: User interface and interactions
- Contains: React components, pages, layouts
- Location: `app/[locale]/`, `components/`
- Depends on: Service layer via API routes, shared packages
- Used by: Browser clients

**API/Handler Layer:**
- Purpose: HTTP request handling and routing
- Contains: Route handlers with NextRequest/NextResponse
- Location: `app/api/` (36+ endpoint directories)
- Depends on: Service layer, Prisma client
- Used by: Presentation layer, mobile clients

**Service Layer:**
- Purpose: Business logic and domain operations
- Contains: Authentication, caching, gamification, content services
- Location: `lib/`, `packages/`
- Depends on: Data layer, external APIs
- Used by: API routes, some server components

**Data Access Layer:**
- Purpose: Database operations and ORM
- Contains: Prisma client singleton, schema definitions
- Location: `lib/prisma.ts`, `prisma/schema.prisma`
- Depends on: PostgreSQL database
- Used by: Service layer

**Cross-Cutting Layer:**
- Purpose: Shared concerns across layers
- Contains: Middleware, rate limiting, error handling, logging
- Location: `middleware.ts`, `lib/rate-limit.ts`, `lib/errors.ts`
- Used by: All layers

## Data Flow

**Web Request Flow:**

```
Browser Request
  ↓
[middleware.ts] - Locale detection, route normalization
  ↓
[Next.js Router] - Route matching
  ↓
Page Component or API Route
  ↓
[Auth Check] - Session validation via SessionProvider
  ↓
[Service Layer] - Business logic in lib/*.ts
  ↓
[Prisma Client] - Database queries
  ↓
[PostgreSQL] - Data persistence
  ↓
Response (JSON or rendered HTML)
```

**Practice Session Flow Example:**
1. User starts practice → `app/[locale]/practice/page.tsx`
2. API call → `app/api/practice/[endpoint]/route.ts`
3. Business logic → `lib/practice-activity.ts`
4. Database query → `prisma.exercise.findMany()`
5. Response transformation → JSON returned to client

**State Management:**
- Server: Database-backed via Prisma
- Client: React Query for server state caching
- Auth: Server-side sessions with NextAuth
- UI: React useState/useReducer for local state

## Key Abstractions

**Service Pattern:**
- Purpose: Encapsulate business logic for domains
- Examples: `lib/auth.ts`, `lib/audio-service.ts`, `lib/spaced-repetition.ts`
- Pattern: Module exports with functions, no class instantiation

**Provider Pattern (React Context):**
- Purpose: Dependency injection for React tree
- Examples: `components/providers/QueryProvider.tsx`, `SessionProvider.tsx`, `ThemeProvider.tsx`
- Pattern: Context.Provider wrapping app in locale layout

**Custom Hooks Pattern:**
- Purpose: Reusable stateful logic for components
- Examples: `hooks/useGameProgress.ts`, `hooks/use-audio-player.ts`
- Pattern: Named exports, `use` prefix convention

**API Client Package:**
- Purpose: Typed HTTP client for all API domains
- Location: `packages/api-client/src/`
- Modules: `practice.ts`, `reader.ts`, `translate.ts`, `discover.ts`, `profile.ts`
- Pattern: Domain-specific modules with typed request/response

**Shared Packages:**
- `@mk/tokens` - Design tokens (colors, spacing)
- `@mk/ui` - Reusable UI components
- `@mk/practice` - Practice session logic
- `@mk/gamification` - XP, streaks, hearts
- `@mk/analytics` - Event tracking

## Entry Points

**Web Entry:**
- Location: `app/layout.tsx`
- Triggers: Initial page load
- Responsibilities: Root HTML, metadata, theme, Sentry, Vercel Analytics

**Locale Entry:**
- Location: `app/[locale]/layout.tsx`
- Triggers: All localized pages
- Responsibilities: Providers (Session, Query, Theme, XP, Locale), AppShell

**API Entry:**
- Location: `app/api/auth/[...nextauth]/route.ts` (authentication)
- Location: `app/api/*/route.ts` (36+ feature endpoints)
- Triggers: HTTP requests from client/mobile
- Responsibilities: Request validation, auth check, business logic, response

**Middleware Entry:**
- Location: `middleware.ts`
- Triggers: All requests before routing
- Responsibilities: Locale detection, route normalization, pathname headers

**Internationalization:**
- Location: `i18n.ts`
- Triggers: Server component translation loading
- Responsibilities: Message loading from `messages/{locale}.json`

## Error Handling

**Strategy:** Throw errors in services, catch at API route boundaries, structured logging

**Patterns:**
- Custom error types in `lib/errors.ts` (NotFoundError, ValidationError, etc.)
- try/catch in all API route handlers
- Error boundary components for React error recovery
- Sentry integration for error tracking with context

**API Error Response Format:**
```typescript
{ error: string, status?: number, details?: object }
```

## Cross-Cutting Concerns

**Logging:**
- Console.log/error with structured prefixes (`[API]`, `[AUTH]`, etc.)
- Sentry for error aggregation

**Validation:**
- Zod schemas at API boundaries
- TypeScript for compile-time type safety
- Prisma for database-level constraints

**Authentication:**
- NextAuth middleware via SessionProvider
- Protected routes check session in API handlers
- Mobile auth via token exchange endpoints

**Rate Limiting:**
- Upstash Redis-based limiting
- Per-endpoint configuration in `lib/rate-limit.ts`
- Graceful degradation when Redis unavailable

---

*Architecture analysis: 2026-01-06*
*Update when major patterns change*
