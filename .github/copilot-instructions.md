# Copilot Coding Agent Instructions

## Project Overview

MK Language Lab (Македонски) is a modern, multilingual learning platform for Macedonian language learners. Built with cutting-edge technologies, it provides AI-powered conversations, interactive practice modules, translation tools, and curated news content.

## Tech Stack & Architecture

### Core Technologies
- **Framework:** Next.js 15 (App Router) with TypeScript 5
- **UI:** React 19, Tailwind CSS 4, shadcn/ui components
- **Database:** Prisma ORM (SQLite for dev, PostgreSQL for production)
- **AI/APIs:** OpenAI GPT-4o-mini, Google Cloud Translate API
- **Localization:** next-intl with English and Macedonian support
- **Testing:** Vitest (unit tests), Playwright (E2E tests)
- **Monitoring:** Sentry for error tracking, Vercel Analytics
- **Deployment:** Vercel with edge runtime support

### Project Structure
```
.
├── app/                          # Next.js App Router pages
│   ├── [locale]/                # Locale-aware routes
│   └── api/                     # API routes (translate, tutor, news)
├── components/                   # React components
│   └── ui/                      # shadcn/ui design system components
├── lib/                         # Utility functions and helpers
├── data/                        # Static content and data modules
├── prisma/                      # Database schema and migrations
├── messages/                    # i18n translation files (en.json, mk.json)
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
├── e2e/                         # Playwright E2E tests
├── docs/                        # Project documentation
└── public/                      # Static assets
```

## Development Workflow

### Prerequisites
- Node.js 20+
- npm (workspaces enabled)
- SQLite (development) / PostgreSQL (production)

### Essential Commands
```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run dev:webpack      # Start dev server with Webpack

# Code Quality
npm run lint             # Run ESLint (max 50 warnings allowed)
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # Run TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm run test             # Run Vitest unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests with UI
npm run test:e2e:debug   # Debug E2E tests

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations (development)
npx prisma migrate deploy # Deploy migrations (production)
npm run prisma:seed      # Seed database with initial data

# Build & Deploy
npm run build            # Create production build
npm run start            # Start production server
```

### Environment Setup

Required environment variables (see `.env.local.example`):
- `DATABASE_URL` - Database connection string (SQLite for dev: `file:./dev.db`)
- `GOOGLE_PROJECT_ID` - Google Cloud project ID for translation API
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - Google service account credentials
- `OPENAI_API_KEY` - OpenAI API key for tutor feature (optional)
- `GOOGLE_DOCS_ID` - Google Docs integration (optional)
- `DICTIONARY_PDF_URL` - Dictionary resource URL (optional)
- `INSTAGRAM_ACCESS_TOKEN` - Set to "demo" for mock data (no API needed)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking (optional)
- `AUTH_SECRET` - NextAuth secret for authentication
- `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)

### Testing Strategy

1. **Unit Tests (Vitest)**
   - Test business logic, hooks, utilities
   - Use React Testing Library for component tests
   - Run automatically in CI pipeline
   - Aim for high coverage on critical paths

2. **E2E Tests (Playwright)**
   - Test complete user workflows
   - Run on Chromium in CI
   - Include accessibility checks
   - Test both English and Macedonian locales

3. **Type Safety**
   - Strict TypeScript configuration
   - Type-check runs in CI before build
   - No implicit any types allowed

### Code Quality Standards

- **Linting:** ESLint with Next.js config, max 50 warnings in CI
- **Formatting:** Prettier with automatic formatting on commit (Husky)
- **Type Safety:** Strict TypeScript mode with full type coverage
- **Git Workflow:** 
  - Feature branches from `main` or `develop`
  - PR required for all changes
  - CI must pass before merge
  - Atomic commits with clear messages

### Common Development Tasks

#### Adding a New Feature
1. Create feature branch from `develop`
2. Implement feature with tests
3. Update relevant documentation in `docs/`
4. Run linting, type-check, and tests locally
5. Create PR with clear description
6. Address review feedback and CI failures

#### Updating Database Schema
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration-name>`
3. Update seed data if needed (`prisma/seed.ts`)
4. Test migrations locally
5. Document schema changes

#### Adding Translations
1. Update `messages/en.json` (source of truth)
2. Add corresponding keys in `messages/mk.json`
3. Use translation keys in components via `useTranslations` hook
4. Test both locales work correctly
5. Follow glossary for consistent terminology

#### Creating New API Route
1. Add route under `app/api/`
2. Use proper HTTP methods and status codes
3. Add error handling and validation (Zod)
4. Document in `docs/api/`
5. Add rate limiting if needed (Upstash)
6. Test with various inputs and edge cases

### CI/CD Pipeline

The `.github/workflows/ci.yml` pipeline runs:
1. **Lint** - ESLint checks
2. **Type Check** - TypeScript compilation
3. **Build** - Production build verification
4. **Unit Tests** - Vitest test suite
5. **E2E Tests** - Playwright browser tests
6. **Mobile Tests** - Maestro smoke tests (optional)

All jobs must pass for PR to be mergeable.

### Important Constraints

- **No Environment File Edits:** Never modify `.env` files - only users can change them
- **Minimal Changes:** Make surgical, focused changes - don't refactor unrelated code
- **Preserve Working Code:** Don't delete or modify working code unless necessary
- **Test Coverage:** Add tests for new features, update tests for changes
- **Documentation:** Update docs when changing APIs, features, or architecture
- **Security:** Never commit secrets, validate inputs, fix vulnerabilities

## Documentation Management

### Project Context

MK Language Lab is a multilingual learning platform built with Next.js 15, the App Router, and TypeScript. Core subsystems include:

- **Localization** driven by `messages/en.json`, `messages/mk.json`, and the `TranslationProvider` in `lib/translation-provider.ts`.
- **Content delivery** using data modules in `data/` and Prisma models defined in `prisma/schema.prisma` and consumed through the translation-aware routes under `app/[locale]/`.
- **Feature experiences** such as journeys, practice modules, tutor support, and translation utilities exposed via client/server components and API routes (`app/api/*`).
- **Design system** components under `components/ui/` with shared patterns used across the application.

Documentation exists to capture how these pieces work together, the decisions behind them, and the workflows for keeping content and localization consistent.

### Target Documentation Structure

We are moving toward the following structure. Create files as they become relevant and keep `Last Updated` metadata current:

```
docs/
├── architecture.md               # System and deployment architecture diagrams
├── api/
│   ├── overview.md               # API surface summary (translate, tasks, tutor, news)
│   └── <route-name>.md           # Deep dives for specific routes/integrations
├── content-pipeline.md           # How data/ and Prisma feed the UI
├── design-system.md              # Guidance for components/ui and usage patterns
├── feature-guides/
│   ├── journeys.md
│   ├── practice-modules.md
│   └── tutor-experience.md
├── localization/
│   ├── overview.md               # Workflow for messages/, TranslationProvider, fallback
│   ├── glossary.md               # Shared terminology (sync with Google Drive glossary)
│   └── qa-checklist.md           # Review steps before publishing new locale content
├── operations/
│   ├── deployment-guide.md       # Vercel/Edge deploy process, env vars, secrets
│   └── troubleshooting.md        # Runbook for common issues (builds, Prisma, translations)
├── roadmap/
│   └── tutor-roadmap.md          # Existing product roadmap (expand to cover other tracks)
└── index.md                      # Living table of contents and ownership map
```

If we add significant new domains (analytics integrations, payment flows, etc.) extend this tree accordingly.

### Copilot Responsibilities by Doc Category

#### 1. Architecture (`docs/architecture.md`)

**Triggers**:

- Adding or refactoring major Next.js layouts, routing flows, or server frameworks.
- Introducing new services (e.g., translation provider, external news feed, tutor AI backend).
- Changing data persistence (Prisma schema updates, new content sources).

**Include**:

- Mermaid diagrams showing page routing, data loading, and API interactions.
- Component/service descriptions with ownership.
- Notable design decisions (SSR vs. SSG, caching, edge runtime usage).

#### 2. API Reference (`docs/api/`)

**Scope**: All routes under `app/api/` plus external services we depend on.

**Triggers**:

- New route or significant change to request/response schema.
- Changes to authentication, rate limiting, or external API usage.

**Include**:

- HTTP method, path, params/body schema, and sample requests/responses.
- Error handling and fallback behavior.
- Dependencies on environment variables, third-party APIs, or background jobs.

#### 3. Feature Guides (`docs/feature-guides/`)

**Purpose**: Explain how each learner-facing experience works end-to-end.

**Triggers**:

- Launching or materially changing a feature screen (journey stats, quick practice, translator, tutor).
- Adding new metrics, content modules, or state management patterns.

**Include**:

- User flow diagrams (Mermaid flowchart or sequence diagrams).
- Key components/hooks (e.g., `use-active-journey.ts`, `QuickPracticeWidget.tsx`).
- Content dependencies (files in `data/`, translation keys).
- Testing approach (Vitest/RTL coverage expectations).

#### 4. Localization (`docs/localization/`)

**Focus**: Translation workflow, message key conventions, quality checks.

**Triggers**:

- Adding a locale, updating translation JSON, changing fallback behavior.
- Introducing new shared terminology or glossary terms.

**Include**:

- Editing workflow (source-of-truth, PR requirements, Google Drive glossary sync).
- Validation checklist (linting scripts, CI steps, manual review).
- Guidance for content authors (string length, tone, cultural notes).

#### 5. Content Pipeline (`docs/content-pipeline.md`)

**Scope**: Relationship between `data/`, Prisma, and UI.

- Document schema changes, seed scripts, and how content surfaces in the app.
- Record requirements for adding new practice content or journeys.

#### 6. Design System (`docs/design-system.md`)

- Capture component usage patterns from `components/ui`.
- Include accessibility standards, theming rules, and when to create new primitives.

#### 7. Operations (`docs/operations/`)

**Deployment Guide**: Hosting environment (e.g., Vercel), environment variables, build pipeline, preview flows, backup strategy for Prisma data.

**Troubleshooting**: Playbooks for localization build failures, Prisma migration conflicts, failing API calls, translation provider outages.

#### 8. Roadmaps (`docs/roadmap/`)

- Maintain existing `tutor-roadmap.md` and add parallel tracks (e.g., localization improvements, content authoring tooling). Link to product planning docs kept in Google Drive for deeper context.

### Integrating Google Drive & Offline Assets

- Store collaborative planning artifacts (glossary spreadsheets, meeting notes) in the designated Google Drive folder. Reference them from docs where appropriate using shared links.
- Ensure critical guides (architecture, localization workflow) have PDF exports stored in Drive for offline access and archived per release.
- Record ownership and review cadence for each document in `docs/index.md`; mirror the same table in Drive for stakeholders without repository access.
- Mirror high-level documentation updates to the GitHub Wiki so collaborators receive notifications even if they do not track repository commits.

### Publishing to GitHub Wiki

- The GitHub Wiki lives in the repo `git@github.com:battaglia-v/mk-language-lab.wiki.git`. Clone it locally alongside the main repository (`git clone git@github.com:battaglia-v/mk-language-lab.wiki.git`).
- Maintain a page titled `Documentation-Updates` summarizing recent changes (use `docs/wiki/Documentation-Updates.md` as the source of truth).
- After editing the wiki content, commit and push to the wiki repository so the changes appear at `https://github.com/battaglia-v/mk-language-lab/wiki/Documentation-Updates`.
- Reference the wiki page link in PR descriptions when documentation updates are included.

### Documentation Best Practices

- **Mermaid Diagrams**: Use `graph TD` for routing/data flow, `sequenceDiagram` for API exchanges, `timeline` for roadmap milestones. Embed diagrams directly in markdown alongside explanatory text.
- **Real Examples**: Reference actual code snippets from this repo (React components, hooks, Prisma migrations). If showing payloads, pull them from working API responses.
- **Cross-linking**: Connect architecture sections to feature guides, link feature docs to localization notes, and surface troubleshooting steps in relevant guides.
- **Metadata**: Every doc should include `Last Updated`, `Owner`, and `Review Cycle` (e.g., quarterly) at the top.
- **Incremental Updates**: Commit documentation updates with the associated feature PR whenever possible. Use follow-up issues for larger rewrites but capture interim notes in the docs immediately.

### Documentation Update Checklist (Project Specific)

- [ ] Modified route under `app/api/` → update corresponding file in `docs/api/`.
- [ ] Added or refactored page/component in `app/[locale]/` or `components/*` → update relevant feature guide and architecture diagrams.
- [ ] Changed `messages/*.json` or localization workflow → update docs in `docs/localization/` and sync glossary references.
- [ ] Updated Prisma schema or content data → document changes in `docs/content-pipeline.md` and note migration steps.
- [ ] Introduced or altered design primitives → refresh `docs/design-system.md` with usage guidance.
- [ ] Significant roadmap decision → adjust `docs/roadmap/` and ensure stakeholders know via Drive links.
- [ ] Update `Last Updated` and verify examples/build steps remain accurate (run lint/tests as needed).

### Resources

- Next.js App Router Documentation — https://nextjs.org/docs/app
- Prisma Documentation — https://www.prisma.io/docs
- i18next / localization best practices — https://www.i18next.com/
- Vercel Deployment Guides — https://vercel.com/docs
- Shared Google Drive folder: `MK Language Lab / Documentation` (ensure offline access for key PDFs)

### Contributing Guidelines

1. Read and follow this documentation strategy before starting feature work.
2. Open an issue describing documentation impacts alongside feature changes.
3. Keep docs and code in sync—submit combined PRs when feasible.
4. Write or update tests (Vitest, RTL) to validate documented behaviors.
5. Request documentation review from the doc owner listed in `docs/index.md` when making substantial edits.
6. After merging, append a brief note to `docs/change-log.md` summarizing doc updates and referencing any mirrored Drive resources.
7. Sync the latest summary to the GitHub Wiki (`Documentation-Updates` page) so collaborators can follow along without cloning the repo.

Our goal is to make MK Language Lab easy to maintain, localize, and extend. Treat documentation as a first-class artifact so teammates and future contributors can ship confidently.