# Codebase Structure

**Analysis Date:** 2026-01-06

## Directory Layout

```
mk-language-lab/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   ├── api/                     # API routes (36+ endpoints)
│   │   ├── auth/                # Authentication
│   │   ├── practice/            # Practice endpoints
│   │   ├── user/                # User data
│   │   ├── reader/              # Reader functionality
│   │   ├── translate/           # Translation
│   │   ├── cron/                # Scheduled tasks
│   │   ├── mobile/              # Mobile-specific APIs
│   │   └── admin/               # Admin endpoints
│   ├── [locale]/                # Localized pages (en, mk)
│   │   ├── layout.tsx           # Locale layout with providers
│   │   ├── dashboard/           # Dashboard
│   │   ├── learn/               # Learning hub
│   │   ├── lesson/              # Lesson pages
│   │   ├── practice/            # Practice mode
│   │   ├── reader/              # Reading interface
│   │   ├── translate/           # Translation tool
│   │   ├── profile/             # User profile
│   │   └── more/                # Settings/more menu
│   └── admin/                   # Admin panel (no locale)
├── components/                   # React components
│   ├── ui/                      # Primitive UI (button, card, etc.)
│   ├── providers/               # Context providers
│   ├── learn/                   # Learning components
│   ├── practice/                # Practice components
│   ├── reader/                  # Reader components
│   ├── profile/                 # Profile components
│   ├── gamification/            # Gamification UI
│   └── layout/                  # Layout components
├── lib/                         # Core services (60+ files)
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client singleton
│   ├── rate-limit.ts            # API rate limiting
│   ├── errors.ts                # Error types
│   ├── gamification/            # XP, streaks logic
│   └── billing/                 # Payment integrations
├── packages/                    # Monorepo packages
│   ├── api-client/              # Typed API client
│   ├── practice/                # Practice logic
│   ├── gamification/            # Gamification logic
│   ├── analytics/               # Analytics events
│   ├── tokens/                  # Design tokens
│   └── ui/                      # Shared UI components
├── hooks/                       # Custom React hooks
├── prisma/                      # Database layer
│   ├── schema.prisma            # Schema (40+ models)
│   └── migrations/              # Migration history
├── data/                        # Content data (JSON)
├── e2e/                         # Playwright E2E tests
├── __tests__/                   # Unit tests
├── tests/                       # Specialized test suites
├── messages/                    # i18n translations
├── middleware.ts                # Request middleware
├── i18n.ts                      # Internationalization config
└── [config files]               # next, tsconfig, etc.
```

## Directory Purposes

**app/**
- Purpose: Next.js App Router pages and API routes
- Contains: Layouts, pages, route handlers
- Key files: `layout.tsx` (root), `[locale]/layout.tsx` (providers)
- Subdirectories: `api/` (REST endpoints), `[locale]/` (pages), `admin/` (admin panel)

**components/**
- Purpose: Reusable React components
- Contains: UI primitives, feature components, providers
- Key files: `providers/SessionProvider.tsx`, `ui/button.tsx`
- Subdirectories: Feature-organized (`learn/`, `practice/`, `reader/`)

**lib/**
- Purpose: Core services and business logic
- Contains: Authentication, database access, external API wrappers
- Key files: `auth.ts`, `prisma.ts`, `rate-limit.ts`, `errors.ts`
- Subdirectories: `gamification/`, `billing/`, `reminders/`

**packages/**
- Purpose: Shared monorepo packages for code reuse
- Contains: Typed API client, domain logic, design tokens
- Key files: Each has `src/index.ts` as entry point
- Pattern: Import via `@mk/package-name` alias

**hooks/**
- Purpose: Custom React hooks for stateful logic
- Contains: Game progress, audio, pronunciation, entitlements
- Key files: `useGameProgress.ts`, `use-audio-player.ts`

**prisma/**
- Purpose: Database schema and migrations
- Contains: Schema definition, migration SQL files
- Key files: `schema.prisma` (40+ models)

**data/**
- Purpose: Static content data for seeding
- Contains: JSON files for vocabulary, lessons, readers
- Key files: `practice-vocabulary.json`, `grammar-lessons.json`

## Key File Locations

**Entry Points:**
- `app/layout.tsx` - Root layout with metadata
- `app/[locale]/layout.tsx` - Locale layout with providers
- `middleware.ts` - Request middleware
- `app/api/auth/[...nextauth]/route.ts` - Auth handler

**Configuration:**
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `.env.example` - Environment variables template

**Core Logic:**
- `lib/auth.ts` - Authentication setup
- `lib/prisma.ts` - Database client
- `lib/rate-limit.ts` - Rate limiting
- `packages/api-client/src/` - API client modules

**Testing:**
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `e2e/*.spec.ts` - E2E test files
- `__tests__/` - Unit test files

**Documentation:**
- `README.md` - Project readme
- `docs/AGENT_INSTRUCTIONS.md` - Agent workflow docs
- `CLAUDE.md` - Claude Code instructions

## Naming Conventions

**Files:**
- PascalCase.tsx: React components (`WordOfTheDay.tsx`)
- camelCase.ts: Utilities and services (`audio-service.ts`, `rate-limit.ts`)
- kebab-case: Multi-word files (`spaced-repetition.ts`)
- route.ts: API route handlers (Next.js convention)
- *.test.ts/tsx: Unit tests
- *.spec.ts: E2E tests

**Directories:**
- lowercase, kebab-case for features (`quick-practice/`)
- Singular for features (`practice/`, `reader/`)
- Plural for collections (`hooks/`, `components/`)
- [param] for dynamic routes (`[locale]/`, `[id]/`)

**Special Patterns:**
- index.ts: Barrel exports for public API
- layout.tsx: Next.js layouts
- page.tsx: Next.js pages
- (group): Route groups (`(auth)/`)

## Where to Add New Code

**New Feature:**
- Primary code: `app/[locale]/[feature]/page.tsx`
- API routes: `app/api/[feature]/route.ts`
- Components: `components/[feature]/`
- Logic: `lib/[feature].ts` or `packages/[feature]/`
- Tests: `e2e/[feature].spec.ts`, `__tests__/`

**New Component:**
- Implementation: `components/[feature]/ComponentName.tsx`
- Tests: Co-located `ComponentName.test.tsx`
- Shared UI: `components/ui/component-name.tsx`

**New API Endpoint:**
- Definition: `app/api/[resource]/route.ts`
- Nested: `app/api/[resource]/[action]/route.ts`
- Tests: `__tests__/api/[resource].test.ts`

**New Hook:**
- Implementation: `hooks/use-[name].ts`
- Pattern: Export named function with `use` prefix

**New Package:**
- Directory: `packages/[name]/`
- Entry: `packages/[name]/src/index.ts`
- Config: `packages/[name]/package.json`
- Alias: Add to `tsconfig.json` paths

## Special Directories

**.planning/**
- Purpose: Project planning documents
- Source: Generated by GSD workflow
- Committed: Yes

**node_modules/**
- Purpose: Installed dependencies
- Source: npm install
- Committed: No (gitignored)

**.next/**
- Purpose: Next.js build output
- Source: Build process
- Committed: No (gitignored)

**test-results/**
- Purpose: Playwright test artifacts
- Source: E2E test runs
- Committed: No (gitignored)

---

*Structure analysis: 2026-01-06*
*Update when directory structure changes*
