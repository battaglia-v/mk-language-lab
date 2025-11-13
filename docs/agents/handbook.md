# Repository Handbook & Guardrails

This document merges the former `AGENTS.md` repository guide with the git/coordination rules from `agent-instructions.chat`. Read it before contributing.

## Project Structure
- App Router pages live in `app/[locale]/` for learner flows, `app/admin/` for staff tooling, and `app/api/` for route handlers.
- Shared UI: `components/`; hooks: `hooks/`; reusable services/utilities: `lib/` and `messages/`.
- Domain data + seeds: `data/`, `prisma/`. Static assets live in `public/` (mobile shells were retired in Nov 2025).
- Docs, QA artifacts, and specs: `docs/`, `playwright-report/`.

## Build & QA Commands
- `npm run dev` – Next.js dev server (Turbopack).
- `npm run build && npm run start` – production smoke test.
- `npm run lint`, `npm run type-check`, `npm run test` – required before any PR.
- `npm run test:e2e` – Playwright suite (needs `.env.local`).
- `npm run prisma:seed` – run whenever schemas or copy change.

## Coding Style
- Default to server components; add `'use client'` only when hooks/state are required.
- Components/types use PascalCase; hooks/helpers/API handlers use camelCase; routes use kebab-case.
- Import shared modules via the `@/` alias. Prettier + ESLint own formatting (2 spaces, single quotes, trailing commas).

## Testing Guidelines
- Vitest runs in jsdom per `vitest.config.ts`; keep `.test.ts(x)` beside the implementation.
- Playwright specs live in `e2e/` and rely on `data-test` selectors.
- Request coverage (`npm run test -- --coverage`) for core flows.

## Commit & PR Expectations
- Keep commits atomic and imperative (e.g., `Fix Quick Practice CTA focus states`).
- Before opening a PR, ensure `npm run lint && npm run test` (and Playwright for UX work) have been run.
- Include impacted routes/modules, verification steps, and screenshots in the PR body when UI changes.

## Security & Config Hygiene
- Never commit secrets. Mirror required env keys in `.env.local.example` only.
- Run `npx prisma migrate dev` before `npm run prisma:seed` to keep `prisma/dev.db` aligned.
- Confirm external credentials (Google, OpenAI, etc.) exist locally before running sync scripts.

## Source-Control Guardrails
- **Never** edit `.env*` files—the user owns environment management.
- Delete unused files only when you authored the code being removed or have explicit approval.
- Coordinate before touching files other agents are actively editing.
- Do not run destructive git commands (`git reset --hard`, `git checkout -- <file>`, etc.) without written user approval.
- Always check `git status` before committing; stage files explicitly (`git add path/to/file`).
- Keep commits scoped with `git commit -m "Message" -- path1 path2`. Use quoted paths when they include brackets.
- Avoid `git rebase` editors by setting `GIT_EDITOR=:` (or pass `--no-edit`) if you must rebase.
- Never amend commits unless the user instructs you to.

Adhering to these guardrails keeps parallel development safe and predictable.
