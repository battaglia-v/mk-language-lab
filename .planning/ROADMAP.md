# Roadmap: MKLanguage Learning System Overhaul

## Overview

Transform MKLanguage from a quiz-centric app into a structured, CEFR-aligned learning system. The journey starts with establishing a curriculum backbone from official UKIM materials, then layers progression tracking, practice integrity, vocabulary management, reader organization, and UX cleanup — culminating in validation that the core promise ("always resume in the right place, next step obvious") is delivered.

## Milestones

- ✅ [v1.0 Beta](milestones/v1.0-ROADMAP.md) (Phases 1-7) — SHIPPED 2026-01-07
- ✅ **v1.1 Curriculum Quality Fix** — Phases 8-16 (shipped 2026-01-09)
- ✅ [v1.2 Infrastructure & CI Overhaul](milestones/v1.2-ROADMAP.md) (Phases 17-20) — SHIPPED 2026-01-09
- ✅ **v1.3 Content Quality & User Journey** — Phases 21-26 (shipped 2026-01-10)
- ✅ [v1.4 Power User Feedback](milestones/v1.4-ROADMAP.md) (Phases 27-32) — SHIPPED 2026-01-10
- ✅ [v1.5 Audio Cleanup & Final Polish](milestones/v1.5-ROADMAP.md) (Phases 33-35) — SHIPPED 2026-01-10
- ✅ [v1.6 Reader Overhaul](milestones/v1.6-ROADMAP.md) (Phases 36-41) — SHIPPED 2026-01-11
- ✅ [v1.7 Learn Experience Overhaul](milestones/v1.7-ROADMAP.md) (Phases 42-46) — SHIPPED 2026-01-11
- 🚧 **v1.8 Quality & Performance** — Phases 47-52 (in progress)

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

<details>
<summary>v1.4 Power User Feedback (Phases 27-32) — SHIPPED 2026-01-10</summary>

- [x] Phase 27: Bug Fixes (4/4 plans) — completed 2026-01-10
- [x] Phase 28: Navigation Overhaul (3/3 plans) — completed 2026-01-10
- [x] Phase 29: Lesson Enhancements (2/2 plans) — completed 2026-01-10
- [x] Phase 30: Vocabulary Display (2/2 plans) — completed 2026-01-10
- [x] Phase 31: State Persistence (1/1 plans) — completed 2026-01-10
- [x] Phase 32: Content & Polish (2/2 plans) — completed 2026-01-10

[Full details](milestones/v1.4-ROADMAP.md)

</details>

<details>
<summary>✅ v1.5 Audio Cleanup & Final Polish (Phases 33-35) — SHIPPED 2026-01-10</summary>

- [x] Phase 33: Audio Removal (2/2 plans) — completed 2026-01-10
- [x] Phase 34: Remaining Polish (3/3 plans) — completed 2026-01-10
- [x] Phase 35: Practice Improvements (1/1 plan) — completed 2026-01-10

[Full details](milestones/v1.5-ROADMAP.md)

</details>

<details>
<summary>✅ v1.6 Reader Overhaul (Phases 36-41) — SHIPPED 2026-01-11</summary>

- [x] Phase 36: A2 Reader Wiring (1/1 plans) — completed 2026-01-10
- [x] Phase 37: Tap-to-Translate (2/2 plans) — completed 2026-01-11
- [x] Phase 38: Reader Vocabulary Save (1/1 plans) — completed 2026-01-11
- [x] Phase 39: Reading Progress (1/1 plans) — completed 2026-01-11
- [x] Phase 40: Discovery & Navigation (1/1 plans) — completed 2026-01-11
- [x] Phase 41: Content & Validation (1/1 plans) — completed 2026-01-11

[Full details](milestones/v1.6-ROADMAP.md)

</details>

<details>
<summary>✅ v1.7 Learn Experience Overhaul (Phases 42-46) — SHIPPED 2026-01-11</summary>

- [x] Phase 42: Lesson Flow Simplification (1/1 plans) — completed 2026-01-11
- [x] Phase 43: Vocabulary & Grammar Audit (2/2 plans) — completed 2026-01-11
- [x] Phase 44: Content Completeness (1/1 plans) — completed 2026-01-11
- [x] Phase 45: Validation & Polish (1/1 plans) — completed 2026-01-11
- [x] Phase 46: Final Validation (1/1 plans) — completed 2026-01-11

[Full details](milestones/v1.7-ROADMAP.md)

</details>

### 🚧 v1.8 Quality & Performance (In Progress)

**Milestone Goal:** Comprehensive quality improvements across UX, content, and performance for all three core areas (Learn, Practice, Reader)

#### Phase 47: Segmented Control Redesign — COMPLETE

**Goal**: Modernize toggle/tab component across 4 locations (Reader, Alphabet, TextImporter, DailyLessons)
**Depends on**: Previous milestone complete
**Research**: Unlikely (existing Radix/shadcn patterns)
**Plans**: 1

Plans:
- [x] 47-01: Tabs redesign with sliding indicator + consumer updates — completed 2026-01-12

#### Phase 48: Learn UX Audit & Polish — COMPLETE

**Goal**: Visual refinements in lesson experience — section navigation, vocabulary cards, grammar displays
**Depends on**: Phase 47
**Research**: Unlikely (internal patterns)
**Plans**: 2

Plans:
- [x] 48-01: Section Navigation & Layout Polish (touch targets, spacing) — completed 2026-01-13
- [x] 48-02: Vocabulary & Grammar Visual Polish (responsive grid, animations) — completed 2026-01-13

#### Phase 49: Practice UX Audit & Polish — COMPLETE

**Goal**: Exercise feedback improvements, session flow smoothness, result screens
**Depends on**: Phase 48
**Research**: Unlikely (internal patterns)
**Plans**: 2

Plans:
- [x] 49-01: Exercise Feedback Animations (staggered choice buttons, bounce on correct) — completed 2026-01-13
- [x] 49-02: Results Screen Polish (animated stat reveals, consistent across modes) — completed 2026-01-13

#### Phase 50: Reader UX Audit & Polish — COMPLETE

**Goal**: Reading experience refinements, vocabulary lookup interactions, progress indicators
**Depends on**: Phase 49
**Research**: Unlikely (internal patterns)
**Plans**: 2

Plans:
- [x] 50-01: Reader Library Animations (story cards, CTAs) — completed 2026-01-13
- [x] 50-02: Reading Experience Polish (vocabulary animations, completion celebration) — completed 2026-01-13

#### Phase 51: Content Quality Audit — COMPLETE

**Goal**: Translation accuracy, example quality, curriculum gap identification across A1/A2/B1
**Depends on**: Phase 50
**Research**: Unlikely (internal content patterns)
**Plans**: 2

Plans:
- [x] 51-01: POS validation & fix (verb-as-noun misclassifications) — completed 2026-01-13
- [x] 51-02: Translation quality audit (0 critical issues found) — completed 2026-01-13

#### Phase 52: Performance Optimization — COMPLETE

**Goal**: Faster loading, better caching strategies, smoother page transitions and navigation
**Depends on**: Phase 51
**Research**: Likely (optimization patterns)
**Research topics**: Next.js optimization, caching strategies, bundle analysis
**Plans**: 1

Plans:
- [x] 52-01: Caching and prefetching optimizations — completed 2026-01-13

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 47. Segmented Control Redesign | v1.8 | 1/1 | Complete | 2026-01-12 |
| 48. Learn UX Audit & Polish | v1.8 | 2/2 | Complete | 2026-01-13 |
| 49. Practice UX Audit & Polish | v1.8 | 2/2 | Complete | 2026-01-13 |
| 50. Reader UX Audit & Polish | v1.8 | 2/2 | Complete | 2026-01-13 |
| 51. Content Quality Audit | v1.8 | 2/2 | Complete | 2026-01-13 |
| 52. Performance Optimization | v1.8 | 1/1 | Complete | 2026-01-13 |

**Completed Milestones:**
- [v1.0 Beta](milestones/v1.0-ROADMAP.md) — 7 phases, 21 plans (shipped 2026-01-07)
- **v1.1 Curriculum Quality Fix** — 9 phases, 18 plans (shipped 2026-01-09)
- [v1.2 Infrastructure & CI](milestones/v1.2-ROADMAP.md) — 4 phases, 7 plans (shipped 2026-01-09)
- **v1.3 Content Quality & User Journey** — 6 phases, 9 plans (shipped 2026-01-10)
- [v1.4 Power User Feedback](milestones/v1.4-ROADMAP.md) — 6 phases, 13 plans (shipped 2026-01-10)
- [v1.5 Audio Cleanup & Final Polish](milestones/v1.5-ROADMAP.md) — 3 phases, 6 plans (shipped 2026-01-10)
- [v1.6 Reader Overhaul](milestones/v1.6-ROADMAP.md) — 6 phases, 7 plans (shipped 2026-01-11)
- [v1.7 Learn Experience Overhaul](milestones/v1.7-ROADMAP.md) — 5 phases, 6 plans (shipped 2026-01-11)

## Domain Expertise

None

## Phase Numbering

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.
