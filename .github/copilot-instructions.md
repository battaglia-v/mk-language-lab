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