# Agent Instructions

> **Universal instructions for all AI agents working on MK Language Lab**
>
> Last Updated: 2025-01-15 | Owner: @battaglia-v

This document provides consistent instructions for AI coding assistants (Claude Code, GitHub Copilot, Cursor, etc.) working on the MK Language Lab project.

---

## Quick Reference

| Resource | Location |
|----------|----------|
| Project README | `README.md` |
| Architecture Docs | `docs/architecture.md` |
| API Documentation | `docs/api/` |
| Change Log | `docs/change-log.md` |
| Agent Memory (Claude) | `.claude/memory/` |
| Copilot Instructions | `.github/copilot-instructions.md` |

---

## 1. Project Overview

**MK Language Lab (Македонски)** is a multilingual learning platform for Macedonian language learners built with:

- **Framework:** Next.js 15 (App Router) + TypeScript 5
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Database:** Prisma ORM (SQLite dev, PostgreSQL prod)
- **AI/APIs:** OpenAI GPT-4o-mini, Google Cloud Translate
- **i18n:** next-intl (English & Macedonian)
- **Testing:** Vitest (unit), Playwright (E2E)

### Key Directories

```
app/                    # Next.js App Router pages
  ├── [locale]/         # Locale-aware routes (en, mk)
  ├── api/              # API routes
  └── admin/            # Admin panel
components/             # React components
  └── ui/               # shadcn/ui design system
lib/                    # Utilities and helpers
data/                   # Static content/fixtures
prisma/                 # Database schema
messages/               # i18n translations (en.json, mk.json)
docs/                   # Project documentation
e2e/                    # Playwright tests
```

---

## 2. Development Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)

# Code Quality
npm run lint             # ESLint (max 50 warnings)
npm run type-check       # TypeScript check
npm run format           # Prettier formatting

# Testing
npm run test             # Vitest unit tests
npm run test:e2e         # Playwright E2E tests

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations

# Build
npm run build            # Production build
```

---

## 3. Agent Guidelines

### 3.1 Before Starting Work

1. **Understand the context**: Read relevant files before making changes
2. **Check existing patterns**: Follow established code conventions
3. **Verify scope**: Make surgical, focused changes—don't refactor unrelated code

### 3.2 Making Changes

1. **Edit existing files** using proper diff/patch tools—never recreate from scratch
2. **Add tests** for new features, update tests for changes
3. **Update translations**: Add keys to both `messages/en.json` AND `messages/mk.json`
4. **Document changes**: Update relevant docs when changing APIs or features

### 3.3 Code Quality Standards

- **TypeScript**: Strict mode, no `any` types
- **ESLint**: Max 50 warnings allowed in CI
- **Imports**: Use `@/` alias for project imports
- **Components**: Use shadcn/ui primitives from `components/ui/`
- **Styling**: Tailwind CSS classes, respect design tokens

### 3.4 Critical Constraints

| ❌ NEVER | ✅ ALWAYS |
|----------|-----------|
| Modify `.env` files | Ask users to set environment variables |
| Delete working code unnecessarily | Preserve functioning implementations |
| Commit secrets/credentials | Use environment variables |
| Skip type checking | Ensure `npm run type-check` passes |
| Ignore test failures | Fix or explain any test issues |

---

## 4. Documentation Standards

When updating documentation:

1. **Add metadata** at the top: `Last Updated`, `Owner`
2. **Use Mermaid diagrams** for architecture/flows
3. **Cross-link** related documents
4. **Update `docs/change-log.md`** for significant changes

### Documentation Triggers

| Change Type | Update Location |
|-------------|-----------------|
| New/modified API route | `docs/api/` |
| Feature changes | `docs/feature-guides/` |
| Translation updates | `docs/localization/` |
| Architecture changes | `docs/architecture.md` |
| Database schema | `docs/content-pipeline.md` |

---

## 5. Claude Code Specific

For Claude Code agents, use the `.claude/memory/` folder for task continuity:

```
.claude/memory/
├── current-task-plan.md   # Active task and status
├── requirements.md        # Current work requirements
└── progress-log.md        # Progress updates
```

### Task Management Pattern

```markdown
# current-task-plan.md

## Task: [Description]

### Chunks:
- [✓] 1. First step (done)
- [→] 2. Current step (in progress)
- [ ] 3. Next step (pending)

### Status:
Working on chunk 2/3. Location: [file path]

### Blockers:
None
```

---

## 6. Common Workflows

### Adding a New Feature

1. Create feature branch from `develop`
2. Implement with tests
3. Update translations in `messages/*.json`
4. Update documentation if needed
5. Verify: `npm run lint && npm run type-check && npm run test`
6. Create PR with clear description

### Updating Database Schema

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <name>`
3. Update seed data if needed
4. Document changes in `docs/content-pipeline.md`

### Adding Translations

1. Add key to `messages/en.json` (source of truth)
2. Add corresponding key to `messages/mk.json`
3. Use `useTranslations('namespace')` hook in components
4. Test both locales

---

## 7. Project Status & Priorities

### Current Phase
- Google Play Store preparation
- Audio feature development (teacher recordings)
- Mobile UX polish

### Key Areas

| Area | Status | Notes |
|------|--------|-------|
| Core Practice | ✅ Complete | Vocabulary, flashcards, cloze |
| Translation | ✅ Complete | Bidirectional EN↔MK |
| News Feed | ✅ Complete | Time.mk, Meta.mk integration |
| Audio | 🚧 Coming Soon | Awaiting teacher recordings |
| Admin Panel | ✅ Complete | Vocabulary, WOTD, Audio CMS |
| Authentication | ✅ Complete | Google, Facebook, credentials |
| Gamification | ✅ Complete | XP, streaks, achievements |

---

## 8. Resources

- **Next.js App Router**: https://nextjs.org/docs/app
- **Prisma**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **next-intl**: https://next-intl-docs.vercel.app

---

## History

This document consolidates:
- `.github/copilot-instructions.md` (GitHub Copilot)
- `CLAUDE.md` (Claude Code agents)
- Agent-specific patterns from various MD files

For the complete project history, see `docs/change-log.md`.
