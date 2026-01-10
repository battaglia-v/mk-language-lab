# Roadmap: MKLanguage Learning System Overhaul

## Overview

Transform MKLanguage from a quiz-centric app into a structured, CEFR-aligned learning system. The journey starts with establishing a curriculum backbone from official UKIM materials, then layers progression tracking, practice integrity, vocabulary management, reader organization, and UX cleanup — culminating in validation that the core promise ("always resume in the right place, next step obvious") is delivered.

## Milestones

- ✅ [v1.0 Beta](milestones/v1.0-ROADMAP.md) (Phases 1-7) — SHIPPED 2026-01-07
- ✅ **v1.1 Curriculum Quality Fix** — Phases 8-16 (shipped 2026-01-09)
- ✅ [v1.2 Infrastructure & CI Overhaul](milestones/v1.2-ROADMAP.md) (Phases 17-20) — SHIPPED 2026-01-09
- ✅ **v1.3 Content Quality & User Journey** — Phases 21-26 (shipped 2026-01-10)
- 🚧 **v1.4 Power User Feedback** — Phases 27-32 (in progress)

## Completed Milestones

<details>
<summary>v1.0 Beta (Phases 1-7) — SHIPPED 2026-01-07</summary>

- [x] Phase 1: Curriculum Backbone (4/4 plans) — completed 2026-01-07
- [x] Phase 2: Progress & Dashboard (3/3 plans) — completed 2026-01-07
- [x] Phase 3: Lesson Practice Integrity (3/3 plans) — completed 2026-01-07
- [x] Phase 4: Vocabulary System (3/3 plans) — completed 2026-01-07
- [x] Phase 5: Reader Reorganization (3/3 plans) — completed 2026-01-07
- [x] Phase 6: Clean Up Confusion (2/2 plans) — completed 2026-01-07
- [x] Phase 7: Validation (3/3 plans) — completed 2026-01-07

[Full details](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v1.1 Curriculum Quality Fix (Phases 8-16) — SHIPPED 2026-01-09</summary>

- [x] Phase 8: PDF Extraction Audit (1/1 plans) — completed 2026-01-07
- [x] Phase 9: Extraction Pipeline Fix (3/3 plans) — completed 2026-01-07
- [x] Phase 10: A1 Vocabulary Extraction (1/1 plans) — completed 2026-01-07
- [x] Phase 11: A1 Grammar Content (1/1 plans) — completed 2026-01-07
- [x] Phase 12: A2 Content Population (1/1 plans) — completed 2026-01-07
- [x] Phase 12.1: UX Fixes (2/2 plans) — completed 2026-01-08 (INSERTED)
- [x] Phase 13: B1 Content Bootstrap (3/3 plans) — completed 2026-01-08
- [x] Phase 14: Content Validation (1/1 plans) — completed 2026-01-08
- [x] Phase 15: Practice Integration (1/1 plans) — completed 2026-01-08
- [x] Phase 16: Practice UX Redesign (2/2 plans) — completed 2026-01-09

</details>

<details>
<summary>✅ v1.2 Infrastructure & CI Overhaul (Phases 17-20) — SHIPPED 2026-01-09</summary>

- [x] Phase 17: CI Pipeline Audit (1/1 plans) — completed 2026-01-09
- [x] Phase 18: CI Pipeline Improvements (1/1 plans) — completed 2026-01-09
- [x] Phase 18.1: Lesson Quality Audit (4/4 plans) — completed 2026-01-09 (INSERTED)
- [x] Phase 19: Cloudflare Research & PoC (1/1 plans) — completed 2026-01-09 — **NO-GO**
- [x] Phase 20: Migration Decision (0/0 plans) — SKIPPED

[Full details](milestones/v1.2-ROADMAP.md)

</details>

<details>
<summary>✅ v1.3 Content Quality & User Journey (Phases 21-26) — SHIPPED 2026-01-10</summary>

**Milestone Goal:** Fix broken interactions, audit content effectiveness, improve Practice UX, and deepen A1/A2/B1 content while maintaining the core promise: "always resume in the right place, next step obvious."

#### Phase 21: Bug Fixes — COMPLETE

**Goal**: Fix clickable vocabulary cards and continue vocabulary name cleanup
**Depends on**: v1.2 complete
**Research**: Unlikely (existing codebase patterns)
**Plans**: 1

Plans:
- [x] 21-01: Vocabulary card interactivity and proper noun filtering — completed 2026-01-09

#### Phase 22: Content Effectiveness Audit — COMPLETE

**Goal**: Verify learning progression, exercise quality, and translation accuracy
**Depends on**: Phase 21
**Research**: Unlikely (CEFR standards already established in codebase)
**Plans**: 1

Plans:
- [x] 22-01: Translation fixes + progression audit + exercise quality review — completed 2026-01-09

#### Phase 23: Practice Feature Audit & UX — COMPLETE

**Goal**: Fix My Saved Words section styling and improve post-lesson practice flow
**Depends on**: Phase 22
**Research**: Unlikely (existing component patterns)
**Plans**: 1

Plans:
- [x] 23-01: i18n for My Saved Words + post-lesson practice prompt — completed 2026-01-09

#### Phase 24: User Journey Cohesion — COMPLETE

**Goal**: Connect Learn → Practice → Reader sections into cohesive navigation flow
**Depends on**: Phase 23
**Research**: Unlikely (internal routing patterns)
**Plans**: 1

Plans:
- [x] 24-01: User journey cohesion CTAs — completed 2026-01-10

#### Phase 25: Content Expansion — COMPLETE

**Goal**: Expand graded reader stories for A1/A2/B1 levels
**Depends on**: Phase 24
**Research**: Unlikely (following existing curriculum structure)
**Plans**: 3

Plans:
- [x] 25-01: A1 reader stories (My Morning, At the Store, My Best Friend) — completed 2026-01-10
- [x] 25-02: A2 reader stories (My Job, Hobbies, The Holiday) — completed 2026-01-10
- [x] 25-03: B1 reader stories (Macedonian Cuisine, City vs Village, Macedonian Legends) — completed 2026-01-10

#### Phase 26: Validation & Polish — COMPLETE

**Goal**: Final testing, polish, and refinements before milestone completion
**Depends on**: Phase 25
**Research**: Unlikely (internal testing patterns)
**Plans**: 2

Plans:
- [x] 26-01: Dark Mode & Component Polish — completed 2026-01-10
- [x] 26-02: User Journey E2E Validation — completed 2026-01-10

</details>

### 🚧 v1.4 Power User Feedback (In Progress)

**Milestone Goal:** Systematic response to real user feedback - bugs, navigation, lesson UX, vocabulary display, state persistence, and content polish.

#### Phase 27: Bug Fixes — COMPLETE

**Goal**: Fix light mode colors, back button labels, expandable examples, conditional tap hints, grammar tone, keyboard hints
**Depends on**: v1.3 complete
**Plans**: 4

Plans:
- [x] 27-01: Light mode colors & back button i18n — completed 2026-01-10
- [x] 27-02: Expandable grammar examples & conditional tap hints — completed 2026-01-10
- [x] 27-03: Macedonian keyboard hints — completed 2026-01-10
- [x] 27-04: Grammar tone & expand/collapse fix — completed 2026-01-10

#### Phase 28: Navigation Overhaul — COMPLETE

**Goal**: Eliminate More menu, create Resources section, add Translate+Analyzer toggle, consolidate user menu, remove Learning Paths
**Depends on**: Phase 27
**Research**: Unlikely (internal routing and component patterns)
**Plans**: 3/3 complete

Plans:
- [x] 28-01: Navigation simplification (More → Resources, UserMenu consolidation) — completed 2026-01-10
- [x] 28-02: Tools merge (Translate + Analyze unified page with toggle) — completed 2026-01-10
- [x] 28-03: Learning Paths removal — completed 2026-01-10

#### Phase 29: Lesson Enhancements — COMPLETE

**Goal**: Wire save-to-glossary on vocab cards, add vocab sort toggle, quick actions, section progress indicator
**Depends on**: Phase 28
**Research**: Unlikely (existing infrastructure for save functionality)
**Plans**: 2/2 complete

Plans:
- [x] 29-01: Vocabulary Save & Sort (save-to-glossary + sort toggle) — completed 2026-01-10
- [x] 29-02: Section Stepper & Quick Actions (mobile stepper dots + vocabulary practice CTA) — completed 2026-01-10

#### Phase 30: Vocabulary Display

**Goal**: Show adjective gender indication, noun definite articles, standardize pronoun order, implement vocabulary chunking
**Depends on**: Phase 29
**Research**: Unlikely (linguistic display patterns established)
**Plans**: TBD

Plans:
- [ ] 30-01: TBD

#### Phase 31: State Persistence

**Goal**: Persist practice session state, lesson quick practice state, add quiz retake capability
**Depends on**: Phase 30
**Research**: Unlikely (localStorage patterns established in codebase)
**Plans**: TBD

Plans:
- [ ] 31-01: TBD

#### Phase 32: Content & Polish

**Goal**: Move alphabet to A1 start, add missing pronouns (наш/нивни), restore MLC credit, standardize translation UX
**Depends on**: Phase 31
**Research**: Unlikely (content and UX patterns established)
**Plans**: TBD

Plans:
- [ ] 32-01: TBD

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 27. Bug Fixes | v1.4 | 4/4 | Complete | 2026-01-10 |
| 28. Navigation Overhaul | v1.4 | 3/3 | Complete | 2026-01-10 |
| 29. Lesson Enhancements | v1.4 | 2/2 | Complete | 2026-01-10 |
| 30. Vocabulary Display | v1.4 | 0/? | Not started | - |
| 31. State Persistence | v1.4 | 0/? | Not started | - |
| 32. Content & Polish | v1.4 | 0/? | Not started | - |

**Completed Milestones:**
- [v1.0 Beta](milestones/v1.0-ROADMAP.md) — 7 phases, 21 plans (shipped 2026-01-07)
- [v1.2 Infrastructure & CI](milestones/v1.2-ROADMAP.md) — 4 phases, 7 plans (shipped 2026-01-09)
- **v1.3 Content Quality & User Journey** — 6 phases, 8 plans (shipped 2026-01-10)

## Domain Expertise

None

## Phase Numbering

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.
