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
- 🚧 **v1.6 Reader Overhaul** — Phases 36-41 (in progress)

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

### 🚧 v1.6 Reader Overhaul (In Progress)

**Milestone Goal:** Transform the Reader section into a comprehensive, mobile-first reading experience with interactive vocabulary features and better content discovery.

#### Phase 36: A2 Reader Wiring — COMPLETE

**Goal**: Wire existing A2 graded reader content to the reader UI and audit all reader content
**Depends on**: v1.5 complete
**Research**: Unlikely (internal patterns, existing content)
**Plans**: 1

Plans:
- [x] 36-01: Graded reader wiring (12 stories A1/A2/B1) — completed 2026-01-10

#### Phase 37: Tap-to-Translate — COMPLETE

**Goal**: Implement tap-to-translate word lookup system for reader content
**Depends on**: Phase 36
**Research**: Likely (dictionary integration, word tokenization)
**Research topics**: Dictionary API options, Cyrillic word tokenization, mobile touch handling
**Plans**: 2

Plans:
- [x] 37-01: Pre-analyze graded readers — completed 2026-01-11
- [x] 37-02: Polish tap visual feedback — completed 2026-01-11

#### Phase 38: Reader Vocabulary Save — COMPLETE

**Goal**: Enable saving words directly to glossary while reading stories
**Depends on**: Phase 37
**Research**: Unlikely (extends existing save-to-glossary patterns from v1.4)
**Plans**: 1

Plans:
- [x] 38-01: Unify reader glossary with favorites system — completed 2026-01-11

#### Phase 39: Reading Progress — COMPLETE

**Goal**: Track story completion, reading time, and per-story progress
**Depends on**: Phase 38
**Research**: Unlikely (similar to existing lesson progress tracking)
**Plans**: 1

Plans:
- [x] 39-01: Reading progress tracking and library card status — completed 2026-01-11

#### Phase 40: Discovery & Navigation — COMPLETE

**Goal**: Better filtering by level/topic, improved story browsing experience
**Depends on**: Phase 39
**Research**: Unlikely (internal UI patterns)
**Plans**: 1

Plans:
- [x] 40-01: Topic filtering, sort options, Continue Reading card — completed 2026-01-11

#### Phase 41: Content & Validation — COMPLETE

**Goal**: Validate v1.6 Reader features with comprehensive E2E tests
**Depends on**: Phase 40
**Research**: None
**Plans**: 1

Plans:
- [x] 41-01: Reader E2E test suite — completed 2026-01-11

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 36. A2 Reader Wiring | v1.6 | 1/1 | Complete | 2026-01-10 |
| 37. Tap-to-Translate | v1.6 | 2/2 | Complete | 2026-01-11 |
| 38. Reader Vocabulary Save | v1.6 | 1/1 | Complete | 2026-01-11 |
| 39. Reading Progress | v1.6 | 1/1 | Complete | 2026-01-11 |
| 40. Discovery & Navigation | v1.6 | 1/1 | Complete | 2026-01-11 |
| 41. Content & Validation | v1.6 | 1/1 | Complete | 2026-01-11 |

**Completed Milestones:**
- [v1.0 Beta](milestones/v1.0-ROADMAP.md) — 7 phases, 21 plans (shipped 2026-01-07)
- [v1.2 Infrastructure & CI](milestones/v1.2-ROADMAP.md) — 4 phases, 7 plans (shipped 2026-01-09)
- **v1.3 Content Quality & User Journey** — 6 phases, 8 plans (shipped 2026-01-10)
- [v1.4 Power User Feedback](milestones/v1.4-ROADMAP.md) — 6 phases, 13 plans (shipped 2026-01-10)
- [v1.5 Audio Cleanup & Final Polish](milestones/v1.5-ROADMAP.md) — 3 phases, 6 plans (shipped 2026-01-10)

## Domain Expertise

None

## Phase Numbering

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.
