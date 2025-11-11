# Repository Guidelines

## Project Structure & Module Organization
App Router pages live in `app/[locale]/` for learner flows, `app/admin/` for staff tooling, and `app/api/` for route handlers; shared UI sits in `components/`, hooks in `hooks/`, and reusable services in `lib/` plus `messages/`. Domain data and seeds live in `data/` and `prisma/`, QA artefacts in `docs/` and `playwright-report/`, and static assets plus Capacitor shells stay in `public/`, `android/`, and `ios/`.

## Build, Test & Development Commands
- `npm run dev` – Start the Next.js Turbopack dev server.
- `npm run build && npm run start` – Build and serve the production bundle for smoke tests.
- `npm run lint`, `npm run lint:fix`, `npm run type-check` – Run lint + TypeScript gates before any PR.
- `npm run format:check` / `npm run format` – Enforce Prettier automatically.
- `npm run test`, `npm run test:e2e`, `npm run prisma:seed`, `npm run sync:content` – Exercise Vitest, Playwright, database refresh, and Google Sheets sync whenever schemas or copy shift.

## Coding Style & Naming Conventions
Default to server components in `app/` and add `"use client"` only when interactivity or browser-only hooks demand it. Components and types are PascalCase, hooks/helpers/API handlers camelCase, and route folders follow kebab-case URLs. Import shared modules through the `@/` alias, and let Prettier (2 spaces, single quotes, trailing commas) plus ESLint decide formatting.

## Testing Guidelines
Vitest runs in jsdom per `vitest.config.ts`; keep `.test.ts(x)` files beside the code (`components/**`, `lib/**`) and wire mocks through `vitest.setup.ts`. Request coverage with `npm run test -- --coverage` whenever you touch core flows. Playwright specs live in `e2e/`, depend on `.env.local`, emit HTML to `playwright-report/`, and should rely on documented `data-test` selectors.

## Commit & Pull Request Guidelines
Commits follow the existing imperative, sentence-case tone (`Fix Quick Practice UX issues`) and should bundle logically complete changes. Before opening a PR, squash noisy checkpoints and include a crisp summary, impacted routes/modules, verification commands (`npm run lint && npm run test`, plus `npm run test:e2e` for UX work), and screenshots or recordings for UI deltas. Reference linked issues and call out database or env updates so reviewers can refresh `.env.local.example`.

## Security & Configuration Tips
Keep real secrets out of git; mirror required keys in `.env.local.example`. Run `npx prisma migrate dev` before `npm run prisma:seed` to keep `prisma/dev.db` aligned, and confirm the Google/OpenAI credentials used by `scripts/` exist locally before syncing content.
