# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-10)

**Core value:** The app always resumes me in the right place and makes my next step obvious.
**Current focus:** v1.5 planning (audio removal, remaining polish, practice improvements)

## Current Position

Phase: 34 of 35 (Remaining Polish)
Plan: 1 of ? in current phase
Status: Plan complete
Last activity: 2026-01-10 — Completed 34-01-PLAN.md

Progress: [████░░░░░░] ~40% (v1.5 in progress)

## Milestone Summary

**v1.0 Beta shipped 2026-01-07**
- 7 phases, 21 plans, 57 commits
- 102 files modified (+6,342 / -737 lines)
- ~24,400 lines of TypeScript

**v1.1 Curriculum Quality Fix shipped 2026-01-09**
- 9 phases (8-16), 18 plans
- Content quality fixes across A1, A2, B1 levels
- Practice UX redesign

**v1.2 Infrastructure & CI Overhaul shipped 2026-01-09**
- 4 phases (17-20), 7 plans, 25 commits
- CI pipeline audit and caching optimizations
- Cloudflare migration evaluated (NO-GO)
- Dark mode ~95%, exercise variety 5 types, content completeness verified

**v1.3 Content Quality & User Journey shipped 2026-01-10**
- 6 phases (21-26), 9 plans
- User journey CTAs connecting Learn → Practice → Reader
- 9 new graded reader stories (A1/A2/B1)
- 72 E2E tests validating core promise

**v1.4 Power User Feedback shipped 2026-01-10**
- 6 phases (27-32), 13 plans, 67 commits
- 89 files modified (+5,514 / -1,193 lines)
- Navigation overhaul (More → Resources, Tools merge)
- Vocabulary enhancements (save-to-glossary, gender colors, definite articles)
- Session persistence for practice
- Alphabet curriculum integration

See `.planning/MILESTONES.md` for full details.

## Success Criteria (v1.4)

**Bug Fixes (Phase 27):** COMPLETE
- [x] Light mode color fixes across 15+ components
- [x] Back button i18n for Learn/Reader pages
- [x] Expandable grammar examples with "show more"
- [x] Macedonian keyboard hints for text inputs

**Navigation Overhaul (Phase 28):** COMPLETE
- [x] More menu → Resources page
- [x] UserMenu consolidation with Settings/Help/About
- [x] Tools merge (Translate + Analyzer unified)
- [x] Learning Paths removed

**Lesson Enhancements (Phase 29):** COMPLETE
- [x] Save-to-glossary on vocabulary cards
- [x] Vocabulary sort toggle (Category/A-Ш/Type)
- [x] Section stepper dots for mobile
- [x] Vocabulary practice CTA

**Vocabulary Display (Phase 30):** COMPLETE
- [x] Gender annotations with color coding (sky=m, rose=f, amber=n)
- [x] Definite article display for nouns
- [x] Redundant Back to Dashboard links removed

**State Persistence (Phase 31):** COMPLETE
- [x] Practice session persistence (localStorage)
- [x] Resume prompt with i18n
- [x] 24-hour staleness threshold, debounced saves

**Content & Polish (Phase 32):** COMPLETE
- [x] Alphabet lesson as first A1 curriculum node
- [x] Missing pronouns (наш/нивни) exercises added
- [x] MLC badge attribution restored in Reader
- [x] Translation UX audit (already consistent)

## Performance Metrics

**Velocity:**
- Total plans completed: 68
- Average duration: ~9 min
- Total execution time: ~10 hours

**By Milestone:**

| Milestone | Phases | Plans | Commits | Duration |
|-----------|--------|-------|---------|----------|
| v1.0 Beta | 7 | 21 | 57 | 1 day |
| v1.1 Curriculum | 9 | 18 | ~40 | 2 days |
| v1.2 Infrastructure | 4 | 7 | 25 | 1 day |
| v1.3 User Journey | 6 | 9 | ~30 | 1 day |
| v1.4 Power User | 6 | 13 | 67 | 1 day |

## Accumulated Context

### Decisions

All decisions logged in PROJECT.md Key Decisions table with outcomes.

### Deferred Issues

- Cloudflare migration — Re-evaluate when OpenNext supports Next.js 16
- ISS-001: Wire A2 graded readers to reader UI — content exists, not wired
- Quiz retake button — not implemented in v1.4
- Section stepper forward navigation — partial implementation

### Blockers/Concerns

None.

### Roadmap Evolution

- Milestone v1.0 shipped: Complete learning system overhaul (Phases 1-7)
- Milestone v1.1 shipped: Curriculum quality fix (Phases 8-16)
- Milestone v1.2 shipped: Infrastructure & CI overhaul (Phases 17-20)
- Milestone v1.3 shipped: Content quality & user journey (Phases 21-26)
- Milestone v1.4 shipped: Power user feedback (Phases 27-32)
- Milestone v1.5 planned: Audio removal + remaining polish + practice improvements

## Session Continuity

Last session: 2026-01-10
Stopped at: Completed 34-01-PLAN.md (About credits & UserMenu cleanup)
Resume file: None
Next step: /gsd:plan-phase 34 (plan 02 for remaining polish items)
